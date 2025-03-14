const express = require('express');
const router = express.Router();
const axios = require('axios');
router.post('/',async (req, res) =>{
    let dbobj = res.locals.dbobj;

   let {pincode} = req.body;
//    console.log("pincode",pincode)
try {
    if(pincode != null){
        let url =  `https://api.postalpincode.in/pincode/${pincode}`;
        let pincode_data = await axios.get(url);
           if(pincode_data.status=200){
               let access_pin = pincode_data.data;
               // console.log("access_pin",access_pin);
               if (access_pin[0].Status = true){
                   console.log("Sucess");
                   let post_ofice = access_pin[0].PostOffice;
                   // console.log("helloworld2",post_ofice);
                   for (let i=0;i<post_ofice.length; i++){
                       let delivery_status = post_ofice[i].DeliveryStatus;
                       if (delivery_status==='Delivery'){
                           let places = post_ofice[i].Name;
                           let state = post_ofice[i].State;
                           let country =post_ofice[i].Country;
                           let pincode = post_ofice[i].Pincode;
                           let district = post_ofice[i].District;
                           let records = [{
                               Name: places,
                               State: state,
                               Country: country,
                               Pincode: pincode,
                               District: district,
                               services:'post',
                           }];
                           if (records.services = 'post'){
                            let insert_whole_data = await dbobj.collection('pincode_master').insertMany(records);
                            // console.log(records);
                            if (insert_whole_data.acknowledged ='true'){
                              let service = records.services
                               let place = records[0].Name
                               let ref_rec =[{
                               service:service,
                               area : place,
                               stat : 'A'
                               }]
                               await dbobj.collection("pin_status").insertMany(ref_rec);
                            }
   
       
                           }
                           
                       }
   
                       // console.log(places);
                   }
               }
   
   
           }
   
      } 
} catch (error) {
    console.log(error)
    
}
   
});
module.exports = router;