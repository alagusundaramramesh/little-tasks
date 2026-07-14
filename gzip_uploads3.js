const express = require('express');
const { route } = require('./login');
const UTILS = require('../../utils/util.functions');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const CONFIG = require('../../common/inc.config');

// POST - Register for a game jam
const END_POINT = CONFIG.ENDPOINT;
router.post('/', async (req, res) => {
    let dbobj = res.locals.dbobj;
    let redisobj = res.locals.redisobj;
    try {
        const { name, college, age, contact, game_desc, controller_desc, media, game_title, email, sub_id } = req.body;
        const { game_zip, game_thumbnail, college_id } = req.files || {};
        const user_id = parseInt(req.body.user_id);
        console.log("req.body", req.body);
        console.log("req.body", req.files);
        parseInt(user_id);
        if (!sub_id) { // only check if new submission.
            if (!user_id || !name || !contact || !email) {
                return res.status(400).json({ status: "E", message: 'Missing required fields' });
            }

            if (!game_zip || !game_thumbnail) {
                return res.status(400).json({ status: "E", message: 'Files are missing' });
            }

            if (game_zip === null || game_zip === undefined) {
                return res.status(400).json({ status: "E", message: 'Game Zip file is missing' });
            }
            if (game_thumbnail === null || game_thumbnail === undefined) {
                return res.status(400).json({ status: "E", message: 'Game Thumbnail file is missing' });
            }
            if (college_id === null || college_id === undefined) {
                return res.status(400).json({ status: "E", message: 'College ID is missing' });
            }
        }
        // console.log(1, game_thumbnail)
        if (game_thumbnail !== null && game_thumbnail !== undefined) {

            // check Image size will be under 1MB.
            const ImageSize = 1024 * 1024;
            if (game_thumbnail?.size > ImageSize) {
                return res.status(400).json({ status: "E", message: 'Image Size exist in 1MB' });
            }
        }

        if (college_id !== null && college_id !== undefined) {

            // check Image size will be under 1MB.
            const ImageSize = 1024 * 1024;
            if (college_id?.size > ImageSize) {
                return res.status(400).json({ status: "E", message: 'Image Size exist in 1MB' });
            }
        }
        // console.log(2, game_zip)

        if (game_zip !== null && game_zip !== undefined) {
            // Unzip the File read and check build folder.
            if (game_zip?.size > 100 * 1024 * 1024) {
                return res.status(400).json({ status: "E", message: 'File Size exist in 100MB , Contact support.' });
            }


            // prevent unusual extension file.
            const Extensions = [".exe", ".sh", ".php", ".bat"];
            const ext = path.extname(game_zip?.name).toLowerCase();
            if (Extensions.includes(ext)) {
                return res.status(400).json({ status: "E", message: 'Not a Compability File !' });
            }
        }
        // console.log(3)

        // current GameJam data.
        query_parameter = {
            sub_start_dt: { $lte: new Date() },
            sub_end_dt: { $gte: new Date() },
            stat: "A"
        }
        project_parameter = {
            _id: 0,
        }
        const CurrentGameJam = await dbobj.collection('app_gamejam_master').find(query_parameter).project(project_parameter).limit(1).toArray();
        // console.log("CURRENT GAME", CurrentGameJam);
        if (CurrentGameJam.length === 0) {
            return res.status(400).json({ status: "E", message: 'No Current GameJam!' });
        }

        // work based on sub_id - SUBMISSION ID
        if (sub_id === 0 || sub_id === null || sub_id === undefined || sub_id === "") {

            let get_user_submission = await dbobj.collection('app_gamejam_submission').find({ user_id: user_id, event_id: CurrentGameJam[0]?.event_id }).project({ _id: 0 }).limit(1).toArray();

            if (get_user_submission.length > 0) {
                return res.status(400).json({ status: "E", message: 'GameJam already submitted. You can only edit the existing submission.' });
            }

            //1.generate ALpha numeric
            let unique_name = UTILS.generateRandomAlphaNumeric(8);
            const rootDir = path.join(__dirname, '..', '..', 'uploads');

            let file_path = path.join(rootDir, 'gamejam');
            let Upload_path = file_path + unique_name;

            //if not file automatically create prevent race-condition.
            fs.mkdirSync(file_path, { recursive: true, mode: 0o775 });

            await game_zip.mv(Upload_path);

            // 2. Check the Zip have a Valid folder structure.
            let validate_zip = await UTILS.ValidateZipFolder(Upload_path);
            if (!validate_zip) {
                fs.unlinkSync(Upload_path);
                return res.status(400).json({ status: "E", message: 'Not a Valid Folder Structure Build!' });
            }
            else {
                // if valid then move the file to the final destination and save the path in DB.
                fs.mkdirSync(path.join(rootDir, 'gamejam', unique_name), { recursive: true, mode: 0o775 });

                // inside the folder create build folder and move the zip file there and unzip it.
                let build_path = path.join(rootDir, 'gamejam', unique_name, '1');

                fs.mkdirSync(build_path, { recursive: true, mode: 0o775 });

                // move the zip file to build folder and unzip it.
                let final_zip_path = path.join(build_path, game_zip.name);
                fs.renameSync(Upload_path, final_zip_path);

                await UTILS.UnzipFile(final_zip_path, build_path);

                // Remove the zip file after successful extraction
                await fs.promises.unlink(final_zip_path);

            }

            //3. Image Upload concept - GAME IMG.
            let game_thumbnail_upload_image = await uploadfileToLocal(path.join(file_path, unique_name), game_thumbnail, game_thumbnail ? "game_thumbnail_" + unique_name : unique_name);

            //3.1 Image Upload concept - ID CARD IMG.
            let college_id_card_upload_image = await uploadfileToLocal(path.join(file_path, unique_name), college_id, college_id ? "id_card_" + unique_name : unique_name);

            //upload one copy in S3 for faster delivery and save the URL in DB.
                let build_path = path.join(rootDir, 'gamejam', unique_name, '1');
            console.log("File Path",build_path)
            console.log("File Path",Upload_path)

            console.log("File Path",file_path);
            let UploadImageS3 = await uploadFolderSequential(build_path,unique_name,process.env.AWS_S3_BUCKET_NAME);

            return false;



            // Insert Data into Db.

            const submission = {
                // image & File will stored in server folder
                user_id: user_id,
                email: email,
                event_id: CurrentGameJam[0].event_id, // event_id;
                sub_id: unique_name, // edit purpose
                name: name,
                college: college,
                college_id_card: college_id_card_upload_image?.file_name, // ID card file
                dob: age,
                contact: contact,
                game_details:
                {
                    title: game_title,
                    description: game_desc,
                    thumbnail: game_thumbnail_upload_image?.file_name, // image file
                    controls: controller_desc,
                    orientation: media || "landscape",
                    publish_stat: false,
                    votes: 0,
                    build_id: 1,
                },
                crd_on: new Date(),
                mdy_on: new Date(),
                stat: "A"
            };
            await dbobj.collection('app_gamejam_submission').insertOne(submission);

            //generate build URL
            let build_url = `${END_POINT}/gamejam/${unique_name}/${submission.game_details.build_id}`;

            console.log("BUILD URL", build_url);

            res.status(200).json({ status: "S", message: 'Successfully registered', build_url: build_url })
        }
        else {
            // update the existing submission with new data and files.
            console.log("------EXISTING SUBMISSION EDITING----")
            let game_thumbnail_changed = false;
            let game_zip_changed = false;
            let build_url = "";
            const rootDir = path.join(__dirname, '..', '..', 'uploads');
            console.log({ "user_id": user_id, "sub_id": sub_id });
            let get_user_submission = await dbobj.collection('app_gamejam_submission').find({ user_id: user_id, sub_id: sub_id }).project({ _id: 0 }).limit(1).toArray();
            if (get_user_submission.length > 0) {
                let file_path = path.join(rootDir, 'gamejam');
                //1. check the valid Zip file.
                if (game_zip !== null && game_zip !== undefined) {
                    console.log("---GAME ZIP CHANGE---");

                    let Upload_path = file_path + sub_id;
                    await game_zip.mv(Upload_path);

                    let validate_zip = await UTILS.ValidateZipFolder(Upload_path);
                    if (!validate_zip) {
                        // console.log("2");

                        fs.unlinkSync(Upload_path);
                        return res.status(400).json({ status: "E", message: 'Not a Valid Folder Structure Build!' });
                    }
                    else {
                        // console.log("3");

                        // if valid then move the file to the final destination and save the path in DB.
                        fs.mkdirSync(path.join(rootDir, 'gamejam', sub_id), { recursive: true, mode: 0o775 });

                        // inside the folder create build folder and move the zip file there and unzip it.`${get_user_submission[0]?.game_details?.build_id+1}`
                        let build_path = path.join(rootDir, 'gamejam', sub_id, (get_user_submission[0]?.game_details?.build_id + 1).toString());

                        fs.mkdirSync(build_path, { recursive: true, mode: 0o775 });

                        // move the zip file to build folder and unzip it.
                        let final_zip_path = path.join(build_path, game_zip.name);
                        fs.renameSync(Upload_path, final_zip_path);

                        await UTILS.UnzipFile(final_zip_path, build_path);

                        // Remove the zip file after successful extraction
                        // console.log("Zip exists before delete:", final_zip_path);

                        await fs.promises.unlink(final_zip_path);

                        // console.log("Zip exists after delete:", fs.existsSync(final_zip_path));
                        game_zip_changed = true;
                        // console.log("4");

                    }

                }

                //2.Game Image Validate.
                if (game_thumbnail !== null && game_thumbnail !== undefined) {
                    console.log("---GAME THUMBNAIL CHANGE---");
                    // console.log("5");

                    let upload_image = await uploadfileToLocal(path.join(file_path, sub_id), game_thumbnail, "game_thumbnail_" + sub_id);
                    if (upload_image.status === "S" && upload_image.file_name !== undefined) {
                        // console.log("6");
                        game_thumbnail_changed = true;
                    }
                }

                //2.1 ID card Image Validate.
                if (college_id !== null && college_id !== undefined) {
                    console.log("---COLLEGE ID CHANGE---");
                    // console.log("5");

                    let upload_image = await uploadfileToLocal(path.join(file_path, sub_id), college_id, "id_card_" + sub_id);
                    if (upload_image.status === "S" && upload_image.file_name !== undefined) {
                        // console.log("6");
                        game_thumbnail_changed = true;
                    }
                }



                let previous_data = get_user_submission[0];
                const Updated_data = {
                    // image & File will stored in server folder
                    email: email || previous_data.email,
                    name: name || previous_data.name,
                    college: college || previous_data.college,
                    dob: age || previous_data.age,
                    contact: contact || previous_data.contact,
                    college_id_card: previous_data.college_id_card, // ID card file
                    game_details:
                    {
                        title: game_title || previous_data.game_details.title,
                        description: game_desc || previous_data.game_details.description,
                        controls: controller_desc || previous_data.game_details.controls,
                        thumbnail: previous_data.game_details.thumbnail, // image file
                        publish_stat: previous_data.game_details.publish_stat || false,
                        votes: previous_data?.game_details.votes || 0,
                        build_id: game_zip_changed ? previous_data?.game_details.build_id + 1 : previous_data.game_details.build_id,
                    },
                    mdy_on: new Date(),
                };
                // console.log("FINAL", Updated_data);
                let update_result = await dbobj.collection('app_gamejam_submission').updateOne(
                    { sub_id: sub_id },
                    { $set: Updated_data }
                );
                if (update_result.modifiedCount > 0) {
                    // console.log("7");

                    if (game_zip_changed === true) {
                        // build URL 
                        // build_url = `http://localhost/api/routes/gamejam/${sub_id}/${Updated_data?game_details.build_id`}
                        build_url = `${END_POINT}/gamejam/${sub_id}/${game_zip_changed ? previous_data?.game_details.build_id + 1 : previous_data.game_details.build_id}`;
                    }
                    console.log("BUILD URL", build_url);

                    res.status(200).json({ status: "S", message: 'GameJam updated successfully.', build_url: game_zip_changed ? build_url : null });
                } else {
                    // console.log("8");

                    res.status(200).json({ status: "S", message: 'GameJam  not updated.', });
                }
            }
        }

        // res.status(201).json({ message: 'Successfully registered', registration });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

async function uploadfileToLocal(imagepath, image, file_name) {

    let res = {
        status: true,
        url: "",
        file_name: ""
    }
    try {

        fs.mkdirSync(imagepath, { recursive: true, mode: 0o775 });
        const extension = path.extname(image.name);
        const ext = file_name + extension;
        console.log("EXTENSION", extension);
        console.log("ext", ext);
        // let file_name = Date.now() + path.extname();
        let save_path = path.join(imagepath, ext);
        await image.mv(save_path);
        let url = ` ${END_POINT}/uploads/gamejam/${file_name}/${ext}`
        res.url = url;
        res.file_name = ext;
        return res;
    } catch (error) {
        console.log(error);
    }
}

async function uploadImageToS3(file, filename, directory) {
    console.log("----CALLING UPLOAD S3----");

    let res = {
        status: true,
        url: "",
    }

    const s3 = new S3Client({
        region: process.env.AWS_S3_REGION,
        // credentials: {
        //     accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        //     secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
        // }
    });

    await s3.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `assets/gamejam/${filename}`, // unique filename using timestamp
        // ContentType: 'image/avif',
        Body: file,
    }));
    // await s3.upload(params).promise();
    // let url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/assets/profile_image/${filename}`;
    let url = `https://d2r5hrlw4m5nor.cloudfront.net/profile_image/${filename}`;
    res.url = url;
    return res;
}

async function uploadFile(bucketName, objectKey, filePath) {
    const fileStream = fs.createReadStream(filePath);
    const encodingType = detectFileType(filePath);
    const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `assets/gamejam/${objectKey}`, // unique filename using timestamp
        Body: fileStream,
        // ContentEncoding: EndcodingType, // Crucial header for S3 to know the content is gzipped
        ContentType: getContentType(filePath), // Set the content type of the original file (e.g., 'application/json', 'text/css', etc.)
        cacheControl: 'public, max-age=31536000,immutable', // Cache for 1 year
    };
    // 🔥 Add encoding ONLY if compressed
    if (encodingType === 'gzip') {
        uploadParams.ContentEncoding = 'gzip';
    } else if (encodingType === 'brotli') {
        uploadParams.ContentEncoding = 'br';
    }
    try {
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);
        console.log(`Successfully uploaded ${objectKey} to ${bucketName}`);
    } catch (err) {
        console.error('Error uploading file:', err);
    }
}



function detectFileType(file) {
    if (file.endsWith('.gz')) return 'gzip';
    if (file.endsWith('.br')) return 'brotli';
    return 'none';
}

function getContentType(file) {
    if (file.includes('.js')) return 'application/javascript';
    if (file.includes('.wasm')) return 'application/wasm';
    if (file.includes('.data')) return 'application/octet-stream';
    if (file.endsWith('.html')) return 'text/html';
    return 'application/octet-stream';
}
async function uploadFolderSequential(dir, baseKey, bucket) {
  const files = fs.readdirSync(dir);

  for (let file of files) {
    // ❌ skip junk
    if (file === '.DS_Store' || file === '__MACOSX') continue;

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 🔁 go inside folder (recursive)
      await uploadFile(bucket, key, fullPath);
        
    } else {
      const key = `${baseKey}/${file}`;

      // 🔥 sequential (WAIT each upload)
    }
  }
}