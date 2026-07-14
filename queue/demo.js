/* global $*/
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTournamentData, registerTournament } from "../services/api";
import { useGlobalState } from "../contexts/user";
import CountdownTimer from '../components/home/tournament_countdown';
import TournamentRegistrationPopup from '../components/tournaments/registration_popup';
import { toast } from 'react-toastify';
import EventLeaderboard from './event_leaderboard';
// import SDK from '../../public/assets/js/sdk';
function TournamentDetails() {
    const hasRun = useRef(false);
    const { user } = useGlobalState();
    const user_id = (user) ? user.user_id : "";
    const player_name = (user) ? user.name : "";
    const profile_pic = (user) ? user.profile_pic : 0;
    const [tournament_list, setTournamentList] = useState([]);
    const [recent_participants_data, setRecentParticipants] = useState([]);
    const [timerEnded, setTimerEnded] = useState(false); // Track timer status
    const { event_id, game_id } = useParams();
    const [activeTab, setActiveTab] = useState("how?");
    const [isRegistrationPopupOpen, setIsRegistrationPopupOpen] = useState(false);
    // const [gamerId, setGamerId] = useState("");
    const navigate = useNavigate(); // Hook for navigation
    const [register_button_status, setRegisterBtnStatus] = useState("");
    const iframeRef = useRef(null);
    const sdk = new window.cgesSDK();
    const [xo_game_stat, setxo_game_stat] = useState(false);
    // console.log("params",useParams());
    // console.log("Pgame_id",game_id);
    // console.log("PTOurnamnet",event_id);   
    useEffect(() => {
        document.title = "Home - ChennaiGames";
        if (hasRun.current) return;
        hasRun.current = true;


        get_tournament_list(event_id, user_id, game_id);
        // sdk.testFunc(); 
        
    }); // Run only once when the component mounts

    const get_tournament_list = async (event_id, user_id, game_id) => {

        const responseData = await fetchTournamentData(event_id, user_id, game_id);
        if (responseData.status === "S") {

            // if(responseData.data[0].is_registered === true && game_id == 4){
            //     setxo_game_stat(true);
            // }
            setTournamentList([]); //  Clear old data first
            setTimeout(() => setTournamentList([...responseData.data]), 10); //  Delay update to force re-render
            setRecentParticipants([]); //  Clear old data first
            setTimeout(() => setRecentParticipants([...responseData.recent_participants]), 10); //  Delay update to force re-render
        }
    };
    const handleGamerIdSubmit = async (gamer_handle) => {
        // setGamerId(gamer_handle);
        // Save the gamer ID to the backend or perform other actions
        let register = await registerTournament(event_id, gamer_handle, player_name, profile_pic, game_id);
        if (register) {
            if (register.status === "S") setRegisterBtnStatus("REGISTERED");
            // alert(register.message);
            toast.success(register.message);
            setIsRegistrationPopupOpen(false);

        }
    };

    useEffect(() => {

        if (timerEnded) {
            get_tournament_list(event_id);
        }

    }, [ event_id]); // Dependency on `timerEnded`

    const handleTimerEnd = async () => {
        // await get_tournament_list(event_id);
        // toast.warning("Tournament has ended, please participate another tournament");
        // const After_complete_Tournament = async (event_id, user_id, game_id) => {

        //     const responseData = await fetchTournamentData(event_id, user_id, game_id);
        //     if (responseData.status === "S") {

        //         // if(responseData.data[0].is_registered === true && game_id == 4){
        //         //     setxo_game_stat(true);
        //         // }
        //         setTournamentList([]); //  Clear old data first
        //         setTimeout(() => setTournamentList([...responseData.data])); //  Delay update to force re-render
        //         setRecentParticipants([]); //  Clear old data first
        //         setTimeout(() => setRecentParticipants([...responseData.recent_participants])); //  Delay update to force re-render
        //     }
        // };
        // After_complete_Tournament(event_id, user_id, game_id);
        
        // update End's in state immediately ,
            setTournamentList(prev => {
                const updated = [...prev];
                updated[0].tournament_status = "completed";
                return updated;
            });

        setTimerEnded(prev => !prev); // Toggle to trigger re-render
    };

    const handleRegister = async (e, game_id) => {
        document.getElementById('button-register').disabled = true;
        if (!user) {
            // alert("Please log in to register for the tournament.");
            toast.error("To register for the tournament, please log in.");
            navigate("/login", { replace: true });
            return;
        }
        let gamer_handle = {};
        if (game_id === 1) {
            console.log("chess");
            if (!user.gamer_handle || !user.gamer_handle.chess) {
                // toast.warning("No valid gamer handle found");
                setIsRegistrationPopupOpen(true);
                return;
            }
            else {
                setIsRegistrationPopupOpen(false);
                gamer_handle = user.gamer_handle.chess;
            }
        }
        if (game_id === 2) {
            console.log("clash of clans");
            if (!user.gamer_handle || !user.gamer_handle.clash_clan) {
                // toast.warning("No valid gamer handle found");
                setIsRegistrationPopupOpen(true);
                return;
            }
            else {
                setIsRegistrationPopupOpen(false);
                gamer_handle = user.gamer_handle.clash_clan;
            }
        }
        if (game_id === 3) {
            console.log("clash of Royals");
            if (!user.gamer_handle || !user.gamer_handle.clash_royal) {
                // toast.warning("No valid gamer handle found");
                setIsRegistrationPopupOpen(true);
                return;
            }
            else {
                setIsRegistrationPopupOpen(false);
                gamer_handle = user.gamer_handle.clash_royal;
            }
        }
        if (game_id === 4) {
            console.log("tic tac toe game", user);
            if (!user) {
                toast.warning("Please login to register the tournament");
                return false;
            } else {
                setxo_game_stat(true);
                gamer_handle = Number(user.user_id);
            }
        }
        if (game_id === 5) {
            console.log("Mr Racer game",user);
            if(!user){
                toast.warning("Please login to register the tournament");
                return false;
            }else{
                // setxo_game_stat(true);
                gamer_handle= Number(user.user_id);
            }
        }
        setIsRegistrationPopupOpen(false); // Close popup only if all checks 
        try {
            let register = await registerTournament(event_id, gamer_handle, player_name, profile_pic, game_id);
            // console.log("API Response:", register);

            if (register?.status === "S") {
                setRegisterBtnStatus("REGISTERED");
                toast.success(register.message);
                if (game_id === 4) {
                    setxo_game_stat(true);
                }
                // e.currentTarget.disabled=false;
            } else {
                toast.error(register?.message || "Registration failed.");
            }
            document.getElementById('button-register').disabled = false;
        } catch (error) {
            console.error("Error registering for tournament:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };
    const play_now = async (game_id) => {
        localStorage.setItem('temp_game_info', JSON.stringify({game_id:game_id,event_id:event_id}));
        document.getElementById('playnow-btn').disabled = true;
        function isMobile() {
            const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
            return regex.test(navigator.userAgent);
        }
        if (game_id === 1) {
            if (isMobile()) {
                window.location.href = "chess://";
            } else {
                window.open("https://www.chess.com", "_blank");
            }
        }
        if (game_id === 2) {
            if (isMobile()) {
                window.location.href = "clashofclans://";
            } else {
                window.open("https://play.google.com/store/apps/details?id=com.supercell.clashofclans", "_blank");
            }
        }
        if (game_id === 3) {
            if (isMobile()) {
                window.location.href = "clashroyale://";
            } else {
                window.open("https://play.google.com/store/apps/details?id=com.supercell.clashroyale", "_blank");
            }
        }
        if (game_id == 4) {
            // Use the Sdk link in canvas.
            // document.getElementById('internal-game-disable-btn').style.display = "none";
            // setxo_game_stat(true);

            // Display block in footer.
            if (window.innerWidth >= 992) {
                document.getElementsByClassName('bottom-strip')[0].style.display ="block";
            }


            let user_agent = getOS();
            if (user_agent === "iOS") {
                if (window.matchMedia("(orientation: portrait)").matches) {
                    toast.warning("For Better Experience Rotate a screen landscape.")
                    document.getElementById('playnow-btn').disabled = false;
                } else {
                     source_enable_iframe(game_id)
                }
            } else {
                source_enable_iframe(game_id)
            }
        }
        if(game_id ==5){
            // Use the Sdk link in canvas.
            // document.getElementById('internal-game-disable-btn').style.display = "none";
            // setxo_game_stat(true);

            let user_agent = getOS();
            if (user_agent === "iOS") {
                if (window.matchMedia("(orientation: portrait)").matches) {
                     toast.warning("For Better Experience Rotate a screen landscape.")
                      document.getElementById('playnow-btn').disabled = false;
                } else {
                     source_enable_iframe(game_id)
                }
            } else {
                source_enable_iframe(game_id)
            }
        }
    }

    const source_enable_iframe = (game_id) => {
        document.getElementById('banner_xox').style.display = "none";
        document.getElementById('iframe-div').style.display = "block";
        document.getElementById('game_frame').style.display = "block";
        if(game_id ==4){
        if (iframeRef.current) {
            iframeRef.current.src = '../../games/4/client/index_v1.html?event_id=' + event_id + '&game_id=' + game_id + '&player_name=' + player_name; // or set srcDoc, or postMessage, etc.
        }
        }else if(game_id ==5){
            if (iframeRef.current) {
                iframeRef.current.src = '../../games/5_none_v6/index.html?event_id=' + event_id + '&game_id=' + game_id + '&player_name=' + player_name; // or set srcDoc, or postMessage, etc.
            }
        }
        // check if the screen is desktop and landscape working in i frame else show full tab landscap screen.
        // Only enter fullscreen on mobile
        if (window.innerWidth < 1100) {
            // Small delay to ensure iframe is loaded
            setTimeout(() => {
                enterFullscreen();
            }, 200);
        }
    };

    // This Functions are help to work based on screen resoultion.
    function exitFullscreen() {
        // if iframe will be 500 width else it will hide default height.
        $('#game_frame').width("100%");
        $('#game_frame').height(600);

        
        if (document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                window.top.document.msExitFullscreen();
            }
        }
    }

    const lockOrientation = () => {
        /* eslint-disable no-restricted-globals */
        // setIsMobileres(game_url[id.id].screen)
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape-primary').catch(err => {
                console.error('Failed to lock orientation:', err);
                // alert(err)
                if (screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(e => {
                        console.warn('Landscape lock also failed:', e);
                    });
                }
            });
        } else if (screen.lockOrientation) {
            // Older API
            screen.lockOrientation('landscape-primary') || screen.lockOrientation('landscape');
        }
        /* eslint-disable no-restricted-globals */
    };

    const enterFullscreen = () => {
        // alert(1);
        let iframe = document.getElementById('iframe-div');
        let float_button = document.getElementById('float_button')
        float_button.disabled = false;
        float_button.style.visibility = "visible";
        float_button.style.visibility = "visible";
        float_button.style.display = "flex";
        float_button.style.zIndex = "9999"; // Ensure it's on top
        // console.log("iframe src",iframe.src);

        // if (window.innerWidth < 1100) {
        //     // document.getElementById('game_frame').src = GameInfo.game_url + "?gd_sdk_referrer_url=https://chennaigames.com/games/" + GameInfo.game_id;
        //     alert()
        // }
        if (iframe && window.innerWidth < 1100) {
            if (iframe.requestFullscreen) {

                iframe.requestFullscreen().then(() => {
                    //    $('#preview').css('visibility', 'hidden');
                    $('#game_frame').attr("width", "100%");
                    $('#game_frame').attr("height", "100%");
                    $('#game_frame').css('visibility', 'visible');
                    $('#float_button').css('visibility', 'visible');
                    lockOrientation();
                });
            }
            else if (iframe.mozRequestFullScreen) { // Firefox
                iframe.mozRequestFullScreen().then(() => {
                    //    $('#preview').css('visibility', 'hidden');
                    $('#game_frame').attr("width", "100%");
                    $('#game_frame').attr("height", "100%");
                    $('#game_frame').css('visibility', 'visible');
                    $('#float_button').css('visibility', 'visible');
                    lockOrientation();
                });
            } else if (iframe.webkitRequestFullscreen) { // Chrome, Safari, Opera
                iframe.webkitRequestFullscreen().then(() => {
                    //  $('#preview').css('visibility', 'hidden');
                    $('#game_frame').attr("width", "100%");
                    $('#game_frame').attr("height", "100%");
                    $('#game_frame').css('visibility', 'visible');
                    $('#float_button').css('visibility', 'visible');
                    lockOrientation();
                });
            } else if (iframe.msRequestFullscreen) { // IE/Edge
                iframe.msRequestFullscreen().then(() => {
                    //   $('#preview').css('visibility', 'hidden');
                    $('#game_frame').attr("width", "100%");
                    $('#game_frame').attr("height", "100%");
                    $('#game_frame').css('visibility', 'visible');
                    $('#float_button').css('visibility', 'visible');
                    lockOrientation();
                });
            } else if (iframe.webkitEnterFullscreen) { // iOS Safari
                iframe.webkitEnterFullscreen().then(() => {
                    $('#game_frame').attr("width", "100%");
                    $('#game_frame').attr("height", "100%");
                    $('#game_frame').css('visibility', 'visible');
                    $('#float_button').css('visibility', 'visible');
                    lockOrientation();
                });
            }
        }
        else {

        }
    };

    function getOS() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        if (/android/i.test(userAgent)) {
            return "Android";
        }

        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return "iOS";
        }

        return "Unknown"; // Or handle other operating systems like Windows, macOS, etc.
    }

    document.addEventListener('fullscreenchange', function () {
        if (!document.fullscreenElement) {
            if (window.innerWidth < 1100) {
                document.getElementById('game_frame').style.display = "none";
                document.getElementById('banner_xox').style.display = "block";
                document.getElementById('playnow-btn').disabled = false;
                $('#game_frame').attr("width", "100%");
                $('#game_frame').attr("height", "100%");
                document.getElementById('game_frame').src = "about:blank"
                // $('#preview').css('visibility', 'visible');
                $('#game_frame').css('visibility', 'hidden');

            } else {
                $('.bottom-strip').css('display', 'block');
            }
            $('#float_button').css('visibility', 'hidden');

        }
    });

    if (window.innerWidth < 1100) {
        $('#game_frame').css('visibility', 'hidden');
        $('#float_button').css('display', 'block');
        $('#float_button').css('visibility', 'visible');

    } else {
        // $('#preview').css('display', 'none');
        $('#game_frame').attr("width", "800");
        $('#game_frame').attr("height", "600");
        $('#iframe-div').css("height", "600px");
        // $('.fullscreen_text').css('display', 'block')$('#float_button').css('display','block');
    }

    // Particularly hide  Cursor element on tournamnet info page .
    useEffect(() => {
        const cursor = document.querySelector(".cursor"); // single element
        const cursor_round = document.querySelector(".cursor-follower");
        // console.log("cursor:", cursor);
        // console.log("cursor_round:", cursor_round);

        if (cursor || cursor_round) {
            cursor.style.display = "none"; // hide
            cursor_round.style.display = "none"; // hide
        }
        return () => {
            if (cursor || cursor_round) cursor.style.display = "block";
        };
    }, []);

    function FullscreenChange(params) {
        let elem = document.getElementById('iframe-div'); // or specific element (like a video)
        // const iframeDiv = document.getElementById('iframe-div');
        // iframeDiv.style.display = "flex";
        $('#float_button').css('display', 'block');
        $('#float_button').css('visibility', 'visible');
        $('.bottom-strip').css('display','none');
        $('#game_frame').width("100%");
        $('#game_frame').height("100%");

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE11
            elem.msRequestFullscreen();
        }
    }

    return (
        <>
            {tournament_list.length > 0 ? (
                // console.log("tournament_list", tournament_list),
                <div className="tournament-details-area pd-top-120 pd-bottom-100">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8">
                                <div className="team-details-page-content">
                                    <div className="row mb-4">
                                        <div className="col-md-12" >
                                            <div className="thumb mb-md-0 mb-2">
                                                {(tournament_list[0].game_id === 1 ? (<img className="w-100" src="../../assets/img/tournament/chess_banner.avif" alt="chess_pawn" />)
                                                    : tournament_list[0].game_id === 2 ? (<img className="w-100" src="../../assets/img/tournament/coc_banner.avif" alt="coc" />)
                                                        : tournament_list[0].game_id === 3 ? (<img className="w-100" src="../../assets/img/tournament/cor_banner.avif" alt="cor" />)
                                                            : tournament_list[0].game_id === 4 ? (
                                                                <>
                                                                    {/* <div id='fullscreen-div'> */}
                                                                    <img id="banner_xox" src='../../assets/img/tournament/xo_banner.avif'></img>
                                                                    <div id='iframe-div' style={{ width: "100%", alignItems: 'center', justifyContent: 'center', borderRadius: '5px', zIndex: '5', display: "none" }}>
                                                                        <div id='float_button' style={{
                                                                            top: "5%",
                                                                            left: "0px",
                                                                            position: "absolute",
                                                                            alignItems: "center",
                                                                            borderRadius: "0px 30px 30px 0px",
                                                                            backgroundColor: "#ffffff",
                                                                            display: "none",
                                                                            visibility: "visible",
                                                                            height: "35px",
                                                                            opacity: "50%",
                                                                            justifyContent: "flex-start",
                                                                            marginTop: "10px",
                                                                            marginBottom: "10px",
                                                                            width: "60px",
                                                                            zIndex: "9999"
                                                                        }} onClick={() => { exitFullscreen() }}>

                                                                            <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-14yq2cq" focusable="false" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"
                                                                                style={{
                                                                                    marginLeft: "2px",
                                                                                    width: "17px",
                                                                                    height: "17px",
                                                                                    color: "rgb(104, 66, 255)"
                                                                                }}><path fill-rule="evenodd" clip-rule="evenodd" d="M16.7424 21.6699C16.3724 22.08 15.7401 22.1124 15.3301 21.7424L7.0186 14.2424C5.66045 13.0169 5.66046 10.9831 7.0186 9.75758L15.3301 2.25759C15.7401 1.88759 16.3724 1.92004 16.7424 2.33007C17.1124 2.7401 17.08 3.37243 16.6699 3.74242L8.35847 11.2424C7.8805 11.6737 7.8805 12.3263 8.35847 12.7576L16.6699 20.2576C17.08 20.6276 17.1124 21.2599 16.7424 21.6699Z"></path></svg>
                                                                            <img src="/assets/img/android-icon-144x144.avif" alt="Logo Icon" style={{ fill: "rgb(0, 0, 0)", width: "36px" }} ></img>
                                                                        </div>
                                                                        <iframe height={500} width={"100%"} id='game_frame' ref={iframeRef} name='iframe_a' title='xo-game'
                                                                            style={{ width: '100%', borderRadius: '10px 10px 0px 0px' }}
                                                                            scrolling="none"
                                                                            frameBorder="0"
                                                                            tabIndex={0}
                                                                            allowFullScreen>

                                                                        </iframe>
                                                                    </div>
                                                                    {/* </div> */}

                                                                   <div className="bottom-strip " style={{ backgroundColor: '#222', padding: '5px 10px 5px 10px', marginTop: '0px', borderRadius: '0px 0px 10px 10px' ,display:"none"}}>
                                                                        <div className="row align-items-center" style={{ padding: '0px 5px' }}>
                                                                            <div className="col-12 col-sm-12 ">
                                                                                <div className='row'>
                                                                                    <div className=' d-flex justify-content-between'>
                                                                                        <div className="logo-aligned">
                                                                                            <img src="../images/cg_logo_white.png" width="30" alt="" />
                                                                                            <span className='game_name_footer '>&nbsp;&nbsp;&nbsp;&nbsp;{tournament_list[0]?.event_title?.split('#')[0]}</span>
                                                                                        </div>
                                                                                        <div className=''>
                                                                                            <div className="" style={{ textAlign: 'right' }} onClick={() => { FullscreenChange() }}>
                                                                                                <span title='Fullscreen' className="icon fa fa-2x fa-expand" style={{fontSize:"15px",color:"#fff",fontWeight:"bolder",cursor:'pointer'}}></span>
                                                                                            </div>
                                                                                        </div>

                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                    
                                                                </>
                                                            ) : null
                                                )}
                                            </div>
                                        </div>
                                        {isRegistrationPopupOpen && (
                                            <TournamentRegistrationPopup onRegister={handleGamerIdSubmit} onClose={() => setIsRegistrationPopupOpen(false)} game_id={game_id} tournament_list={tournament_list} />
                                        )}
                                    </div>
                                    <div className="info-meta d-lg-flex justify-content-lg-between align-self-center">
                                        <h3 className="tt-capitalize mobile-medium">{tournament_list[0].event_title}</h3>

                                        {/* Changing the button */}
                                        {/* After Event End close btn will appear logic will be bottom of the code. */}
                                        {(new Date(tournament_list[0]?.end_time) < new Date() ||
                                            tournament_list[0]?.max_participants === tournament_list[0]?.registered_participants) ? (
                                            <button className="btn btn-base" style={{ color: '#fff', backgroundColor: '#FF810E' }} disabled>
                                                CLOSED
                                            </button>
                                        ) : (register_button_status === 'REGISTERED' || tournament_list[0]?.is_registered === true) ? (
                                            <button id="playnow-btn" className="btn btn-base" style={{ color: '#fff', backgroundColor: '#FF810E' }} onClick={() => { play_now(tournament_list[0].game_id) }}>
                                                PLAY NOW
                                            </button>


                                        ) : ((register_button_status === 'REGISTER' || tournament_list[0]?.is_registered === false) ? (
                                            <button className="btn btn-base" id="button-register" style={{ color: '#fff', backgroundColor: '#FF810E' }} onClick={async (e) => { e.currentTarget.disabled = true; await handleRegister(e, tournament_list[0].game_id) }}>
                                                REGISTER NOW
                                            </button>
                                        ) : (
                                            <button className="btn btn-base" style={{ color: '#fff', backgroundColor: '#FF810E' }} disabled={true}>
                                                CLOSED
                                            </button>
                                        ))}

                                    </div>
                                    <div className="info-meta d-lg-flex justify-content-lg-between align-self-center pt-1">
                                        <h5 style={{ color: '#FF810E' }} className="tt-capitalize mobile-medium">{tournament_list[0].tournament_date.toUpperCase()}</h5>

                                    </div>

                                    <div className="price-meta">
                                        <div className="row">
                                            <div className="col-md-3 col-6">
                                                <span className="tt-uppercase">Prize Pool</span> <br />
                                                <span className="tt-uppercase color-base"><img src='../../assets/img/coin.avif' width={15} alt='CGES coin' /> {tournament_list[0].prize_pool}</span>
                                            </div>
                                            <div className="col-md-3 col-6">
                                                <span className="tt-uppercase">DURATION</span> <br />
                                                <span className="tt-uppercase"><i className="fa fa-clock me-2"></i>{tournament_list[0].tournament_duration}</span>

                                            </div>
                                            <div className="col-md-3 col-6">
                                                {/* <span className="tt-uppercase">Win time</span> <br />
                                                <span className="tt-uppercase"><i className="fa fa-clock me-2"></i> 5 Time</span> */}
                                                {tournament_list[0].tournament_status === 'live' ? (
                                                    <>
                                                        <span>ENDS IN:</span>
                                                        <br />
                                                        <span>
                                                            <i className="fa fa-clock"></i>&nbsp;
                                                            <CountdownTimer remainingSeconds={tournament_list[0].remaining_seconds} onTimerEnd={handleTimerEnd} />
                                                        </span>
                                                    </>
                                                ) : tournament_list[0].tournament_status === 'upcoming' ? (
                                                    <>
                                                        <span>STARTS IN:</span>
                                                        <br />
                                                        <span>
                                                            <i className="fa fa-clock"></i>&nbsp;
                                                            <CountdownTimer remainingSeconds={tournament_list[0].remaining_seconds} onTimerEnd={handleTimerEnd} />
                                                        </span>
                                                    </>
                                                ) : tournament_list[0].tournament_status === 'completed'||(new Date(tournament_list[0]?.end_time) < new Date()) ? (
                                                    <>
                                                        <span>COMPLETED</span>
                                                    </>
                                                ) : (
                                                    <b>{tournament_list[0].tournament_status.toUpperCase()}</b>
                                                )}

                                            </div>

                                            <div className="col-md-3 col-6">
                                                <span>#PARTICIPANTS:</span>
                                                <br />
                                                <span>
                                                    <i className="fa fa-user"></i>&nbsp;
                                                    {tournament_list[0].registered_participants}/{tournament_list[0].max_participants}
                                                </span>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="details mt-4 mb-4 price-meta">
                                        <div className="row justify-content-center">
                                            <div className="col-12 d-flex flex-wrap justify-content-center gap-2 mb-3">
                                                {["how?", "rules", "scoring", "leaderboard"].map((tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setActiveTab(tab)}
                                                        style={(activeTab === tab ? { backgroundColor: "#FF810E", color: '#fff' } : { border: '1px solid #FF810E', backgroundColor: "transparent", color: '#fff' })}
                                                        className="btn btn-default"
                                                    >
                                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {(tournament_list[0].game_id === 1 ? (<div className='col-12' style={{ border: '1px solid #34383e', padding: '25px' }}>
                                            {activeTab === "how?" &&
                                                <>
                                                    <div className="col-12" >
                                                        <h4 className="tt-uppercase mb-3">How It  <span className="color-base">Works?</span></h4>
                                                    </div>
                                                    <div className="col-12">
                                                        <h6 className="color-base">Enter & Compete :</h6>
                                                        <p>Join a tournament and start playing <a href="https://www.chess.com" className='color-base' target='blank'>chess.com</a>  Compete against other players and showcase your skills!</p>
                                                        <h6 className="color-base">Seamless Score Tracking :</h6>
                                                        <p>1. No manual submissions! CGES.club automatically records your scores when you play. <br />2. Just link your <b>In-game username</b> once, and you're set.</p>
                                                        <h6 className="color-base">Play Anytime, Anywhere :</h6>
                                                        <p>Tournaments run regularly, giving you the freedom to join and play whenever you want. There’s always a challenge waiting for you.</p>
                                                        <h6 className="color-base">Rise to the Top & Win Rewards :</h6>
                                                        <p>Check the leaderboard to see where you stand. Perform well, earn platform coins, and redeem them for exciting prizes!</p>

                                                    </div>
                                                </>
                                            }
                                            {activeTab === "rules" &&
                                                <>
                                                    <div className="col-12" >
                                                        <h4 className="tt-uppercase mb-3">Tournament <span className="color-base">Rules</span></h4>
                                                    </div>
                                                    <div className="col-12">
                                                        <h6 className="color-base">Match Eligibility :</h6>
                                                        <p>1. Tournament Games only played after joining the tournament will be counted.<br />
                                                            2. Open to All – Any player can join and compete.</p>
                                                        <h6 className="color-base">Match Participation :</h6>
                                                        <p>Valid Game Count – Only games played during the tournament duration will contribute to your final score.</p>
                                                        <h6 className="color-base">Game Modes :</h6>
                                                        <p>All Modes Count – Play in any mode and climb the leaderboard.<br />

                                                            -10 minute Rapid Mode<br />
                                                            -5 minute Bullet Mode<br />
                                                            -1 minute Blitz Mode</p>
                                                        <h6 className="color-base">Prizes & Rewards :</h6>
                                                        <p>Fast Payouts – Rewards will be distributed within minutes after the tournament ends.</p>

                                                        <h6 className="color-base">Tiebreakers :</h6>
                                                        <p>Fair Tie Resolution – If players are tied, the prize will be shared among them.</p>
                                                        <h6 className="color-base">Fair Play Policy :</h6>
                                                        <p>1. No Smurfing or Cheating – Creating new accounts or manipulating results is strictly prohibited.<br />
                                                            2. Strict Consequences – Violators will face a permanent ban and forfeit all rewards.</p>
                                                        <h6 className="color-base">Agreement to Rules :</h6>
                                                        <p>By joining, you agree to all CGES.club tournament rules, terms, and conditions.</p>
                                                    </div>
                                                </>
                                            }
                                            {activeTab === "scoring" &&
                                                <>
                                                    <div className="col-12" >
                                                        <h4 className="tt-uppercase mb-3">Scoring  <span className="color-base">System</span></h4>
                                                    </div>
                                                    <div className="col-12">

                                                        <p>Your score depends on both the match outcome (Win, Draw, or Loss) and the game mode (Bullet, Blitz, or Rapid). Play in any format, and points will be added to your total accordingly.</p>
                                                        <div className="table-responsive">

                                                            <table className="table table-bordered text-center" style={{ color: '#fff' }}>
                                                                <thead className="thead-dark">
                                                                    <tr>
                                                                        <th>Outcome</th>
                                                                        <th>Bullet (1m)</th>
                                                                        <th>Blitz (5m)</th>
                                                                        <th>Rapid (10m)</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                        <td><strong>Win</strong></td>
                                                                        <td>+3</td>
                                                                        <td>+9</td>
                                                                        <td>+15</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td><strong>Draw</strong></td>
                                                                        <td>+1</td>
                                                                        <td>+3</td>
                                                                        <td>+5</td>
                                                                    </tr>
                                                                    <tr> <td><strong>Loss</strong></td>
                                                                        <td>0</td>
                                                                        <td>0</td>
                                                                        <td>0</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <h6 className="color-base">Example Score Calculation :</h6>
                                                        <p>Suppose you:<br />
                                                            ✔ Win two Blitz (5-minute) matches<br />
                                                            ✔ Draw one Bullet (1-minute) match<br />
                                                            ✖ Lose one Rapid (10-minute) match<br /><br />
                                                            Your total score:<br />
                                                            (2 × 9) + (1 × 1) + (0 × 0) = 19 points<br /><br />
                                                            Keep playing, keep winning, and climb the leaderboard to earn exciting rewards!</p>
                                                    </div>
                                                </>
                                            }
                                            {activeTab === "leaderboard" &&
                                                <>
                                                    <div className=" rounded position-relative" ><EventLeaderboard data={tournament_list} /></div>
                                                    {/* <div className=" border rounded position-relative" ><LeaderBoard /></div> */}

                                                </>
                                            }
                                        </div>) :
                                            tournament_list[0].game_id === 2 ? (<div className='col-12' style={{ border: '1px solid #34383e', padding: '25px' }}>
                                                {activeTab === "how?" &&
                                                    <>
                                                        <div className="col-12" >
                                                            <h4 className="tt-uppercase mb-3">How It  <span className="color-base">Works?</span></h4>
                                                        </div>
                                                        <div className="col-12">
                                                            <h6 className="color-base">Enter & Compete :</h6>
                                                            <p>Join a CGES.CLUB  Clash of Clans tournament and start raiding! Compete with other players and showcase your base-building and attack strategies. </p>
                                                            <h6 className="color-base">Trophy-Based Scoring System :</h6>
                                                            <p>1. You're in-game trophy count is used to calculate your score.</p>
                                                            <p>2. As you earn trophies, you gain platform points based on your trophy range.</p>
                                                            <p>3. The higher your trophy level, the more points you earn per trophy rewarding top performers!</p>
                                                            <h6 className="color-base">Seamless Score Tracking :</h6>
                                                            <p>1. No need for screenshots or manual score uploads. </p>
                                                            <p>2. Simply link your Clash of Clans player tag once. CGES.club will auto-track your trophy progress during the tournament window. </p>
                                                            <h6 className="color-base">Play at Your Own Pace :</h6>
                                                            <p>Tournaments run regularly join whenever you want and progress at your own speed. Whether you’re pushing trophies in war or multiplayer, it all counts! </p>
                                                            <h6 className="color-base">Rise, Rule & Get Rewarded :</h6>
                                                            <p>Check the leaderboard to see how you stack up against others. Earn platform coins as you rank higher and redeem them for exciting prizes, coupons, or exclusive merch! </p>

                                                        </div>
                                                    </>
                                                }
                                                {activeTab === "rules" &&
                                                    <>
                                                        <div className="col-12" >
                                                            <h4 className="tt-uppercase mb-3">Tournament <span className="color-base">Rules</span></h4>
                                                        </div>
                                                        <div className="col-12">
                                                            <h6 className="color-base">Match Eligibility :</h6>
                                                            <p>1. Tournament Activity only trophy progress made after joining the tournament will be counted. <br />
                                                                2. Open for All –  Anyone with a valid Clash of Clans player tag can join and compete.</p>
                                                            <h6 className="color-base">Match Participation :</h6>
                                                            <p>Valid Trophy Gains – Only trophies earned within the tournament time window will contribute to your final score.</p>
                                                            <h6 className="color-base">Game Modes :</h6>
                                                            <p>All Battles Count – Play in any mode that affects your trophy count: <br />
                                                                - Multiplayer Battles <br />
                                                                - Legend League attacks <br />
                                                                - War Attacks (if they impact trophies) </p>
                                                            <h6 className="color-base">Prizes & Rewards :</h6>
                                                            <p>Instant Rewards – Platform coins and rewards will be distributed within minutes after the tournament ends. </p>

                                                            <h6 className="color-base">Tiebreakers :</h6>
                                                            <p>Fair Tie Resolution – If two or more players finish with the same score, the prize will be split equally among them </p>
                                                            <h6 className="color-base">Fair Play Policy :</h6>
                                                            <p>1. No Smurfing or Cheating – Creating fake accounts or manipulating attacks is strictly prohibited. <br />
                                                                2. Zero Tolerance – Any violation will lead to permanent bans and reward forfeiture.</p>
                                                            <h6 className="color-base">Agreement to Rules :</h6>
                                                            <p>By joining the tournament, you agree to abide by all CGES.club rules, terms, and conditions. </p>
                                                        </div>
                                                    </>
                                                }
                                                {activeTab === "scoring" &&
                                                    <>
                                                        <div className="col-12" >
                                                            <h4 className="tt-uppercase mb-3">Scoring  <span className="color-base">System</span></h4>
                                                        </div>
                                                        <div className="col-12">

                                                            <p>Your score is calculated based on the number of trophies you earn during the tournament and your trophy slab. The higher your trophy range, the more points you earn per trophy. </p>
                                                            <div className="table-responsive">

                                                                <table className="table table-bordered text-center" style={{ color: '#fff' }}>
                                                                    <thead className="thead-dark">
                                                                        <tr>
                                                                            <th> Trophy Slab </th>
                                                                            <th>Points Per Trophy </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td><strong>0–999 </strong></td>
                                                                            <td>1</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td><strong>1,000–1,999 </strong></td>
                                                                            <td>2</td>
                                                                        </tr>
                                                                        <tr> <td><strong>2,000–2,999 </strong></td>
                                                                            <td>3</td>
                                                                        </tr>
                                                                        <tr> <td><strong>3,000–3,999  </strong></td>
                                                                            <td>4</td>
                                                                        </tr>
                                                                        <tr> <td><strong>4,000–4,999  </strong></td>
                                                                            <td>5</td>
                                                                        </tr>
                                                                        <tr> <td><strong>5,000–5,999  </strong></td>
                                                                            <td>6</td>
                                                                        </tr>
                                                                        <tr> <td><strong>6,000–6,499 </strong></td>
                                                                            <td>7</td>
                                                                        </tr>
                                                                        <tr> <td><strong>6,500–6,999 </strong></td>
                                                                            <td>8</td>
                                                                        </tr>
                                                                        <tr> <td><strong>7,000–7,999  </strong></td>
                                                                            <td>9</td>
                                                                        </tr>
                                                                        <tr> <td><strong>8,000+ </strong></td>
                                                                            <td>10</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <h6 className="color-base">Example Score Calculation :</h6>
                                                            <p>Suppose your trophy count changes during the tournament as follows: <br />
                                                                ✔ Start: 3,455<br />
                                                                ✔ End: 3,678<br />
                                                                You earned 223 trophies, and you're in the 3,000–3,999 slab, which gives 4 points per trophy.<br />
                                                                Your Total Score = 223 × 4 = 892 points <br />
                                                                Keep playing, keep winning, and climb the leaderboard to earn exciting rewards!</p>
                                                        </div>
                                                    </>
                                                }
                                                {activeTab === "leaderboard" &&
                                                    <>
                                                        <div className=" rounded position-relative" ><EventLeaderboard data={tournament_list} /></div>
                                                        {/* <div className=" border rounded position-relative" ><LeaderBoard /></div> */}

                                                    </>
                                                }
                                            </div>) :
                                                tournament_list[0].game_id === 3 ? (<div className='col-12' style={{ border: '1px solid #34383e', padding: '25px' }}>
                                                    {activeTab === "how?" &&
                                                        <>
                                                            <div className="col-12" >
                                                                <h4 className="tt-uppercase mb-3">How It  <span className="color-base">Works?</span></h4>
                                                            </div>
                                                            <div className="col-12">
                                                                <h6 className="color-base">Enter & Battle :</h6>
                                                                <p>Join a CGES.club Clash Royale tournament and jump into the action! Battle other players in real-time and climb the trophy ladder with your best decks. </p>
                                                                <h6 className="color-base">Trophy-Based Point System:</h6>
                                                                <p>1. As you earn trophies, you also earn platform points.  </p>
                                                                <p>2. Players are placed in trophy slabs, and higher slabs give more points per trophy.  </p>
                                                                <p>3. This means skilled players at higher arenas are rewarded more for each win!   </p>
                                                                <h6 className="color-base">Seamless Score Tracking :</h6>
                                                                <p>1. No screenshots or manual submissions needed.  </p>
                                                                <p>2. Just link your Clash Royale player tag once, and CGES.club will automatically track your trophy progress during the event.  </p>
                                                                <h6 className="color-base">Play Anytime, Climb Anytime: </h6>
                                                                <p>Tournaments run regularly you can join and play whenever you want. Whether you’re playing Ladder or Party Mode, your trophy gains count!  </p>
                                                                <h6 className="color-base"> Climb the Leaderboard & Win Big :</h6>
                                                                <p>Track your position on the live leaderboard. The more points you earn, the higher you rank — and the more platform coins you collect. Redeem them for cool rewards, coupons, or exclusive merch!  </p>

                                                            </div>
                                                        </>
                                                    }
                                                    {activeTab === "rules" &&
                                                        <>
                                                            <div className="col-12" >
                                                                <h4 className="tt-uppercase mb-3">Tournament <span className="color-base">Rules</span></h4>
                                                            </div>
                                                            <div className="col-12">
                                                                <h6 className="color-base">Match Eligibility :</h6>
                                                                <p>1. Tournament Battles  Only–  Only trophy changes after you join the tournament will be counted.  <br />
                                                                    2. Open for All –  Any player with a valid Clash Royale tag can join and compete.</p>
                                                                <h6 className="color-base">Match Participation :</h6>
                                                                <p>Valid Trophy Gains – Only trophy progress made within the tournament timeframe contributes to your final score. </p>
                                                                <h6 className="color-base">Game Modes :</h6>
                                                                <p>All Trophy-Based Modes Count – Play in any mode that impacts your trophy count: <br />

                                                                    - Ladder Matches (1v1) <br />
                                                                    - Trophy Road <br />
                                                                    - Challenge Modes (if trophies are gained) <br />
                                                                    - Party Mode (if trophies are gained)  </p>

                                                                <h6 className="color-base">Prizes & Rewards :</h6>
                                                                <p>Fast Payouts  – Platform coins and other rewards will be credited within minutes after the tournament ends.  </p>

                                                                <h6 className="color-base">Tiebreakers :</h6>
                                                                <p>Fair Tie Resolution – If multiple players end with the same score, the prize will be shared among them.  </p>
                                                                <h6 className="color-base">Fair Play Policy :</h6>
                                                                <p>1. No Smurfing or Cheating – Using secondary accounts or manipulating matchmaking is strictly forbidden.  <br />
                                                                    2. Immediate Disqualification – Violators will be permanently banned and forfeit all rewards. </p>
                                                                <h6 className="color-base">Agreement to Rules :</h6>
                                                                <p>By joining the tournament,  you agree to all CGES.club tournament rules, terms, and conditions.  </p>
                                                            </div>
                                                        </>
                                                    }
                                                    {activeTab === "scoring" &&
                                                        <>
                                                            <div className="col-12" >
                                                                <h4 className="tt-uppercase mb-3">Scoring  <span className="color-base">System</span></h4>
                                                            </div>
                                                            <div className="col-12">

                                                                <p>Your tournament score is based on how many trophies you earn during the event and the arena level you're in. The higher the arena, the more points you get for each trophy gained!  </p>
                                                                <div className="table-responsive">

                                                                    <table className="table table-bordered text-center" style={{ color: '#fff' }}>
                                                                        <thead className="thead-dark">
                                                                            <tr>
                                                                                <th> Trophy Slab </th>
                                                                                <th>Points Per Trophy </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td><strong>0–999 </strong></td>
                                                                                <td>1</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td><strong>1,000–1,999 </strong></td>
                                                                                <td>2</td>
                                                                            </tr>
                                                                            <tr> <td><strong>2,000–2,999 </strong></td>
                                                                                <td>3</td>
                                                                            </tr>
                                                                            <tr> <td><strong>3,000–3,999  </strong></td>

                                                                                <td>4</td>
                                                                            </tr>
                                                                            <tr> <td><strong>4,000–4,999  </strong></td>
                                                                                <td>5</td>
                                                                            </tr>
                                                                            <tr> <td><strong>5,000–5,999  </strong></td>
                                                                                <td>6</td>
                                                                            </tr>
                                                                            <tr> <td><strong>6,000–6,499 </strong></td>
                                                                                <td>7</td>
                                                                            </tr>
                                                                            <tr> <td><strong>6,500–6,999 </strong></td>
                                                                                <td>8</td>
                                                                            </tr>
                                                                            <tr> <td><strong>7,000–7,999  </strong></td>
                                                                                <td>9</td>
                                                                            </tr>
                                                                            <tr> <td><strong>8,000+ </strong></td>
                                                                                <td>10</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                <h6 className="color-base">Example Score Calculation :</h6>
                                                                <p>Let’s say during the tournament:  <br />
                                                                    You crossed two different slabs during the tournament: <br />
                                                                    ✔ From 3,876 to 3,999 → This is in the 3,000–3,999 slab → 4 points per trophy <br />
                                                                    ✔ From 4,000 to 4,542 → This is in the 4,000–4,999 slab → 5 points per trophy  <br />

                                                                    Detailed Calculation: .<br />
                                                                    Slab 1 (3,876–3,999) = 124 trophies × 4 points = 496 points  <br />
                                                                    Slab 2 (4,000–4,542) = 543 trophies × 5 points = 2,715 points<br />
                                                                    Total Score: <br />
                                                                    496 + 2,715 = 3,211 Points <br />
                                                                    Keep playing, keep winning, and climb the leaderboard to earn exciting rewards!
                                                                </p>
                                                            </div>
                                                        </>
                                                    }
                                                    {activeTab === "leaderboard" &&
                                                        <>
                                                            <div className=" rounded position-relative" ><EventLeaderboard data={tournament_list} /></div>
                                                            {/* <div className=" border rounded position-relative" ><LeaderBoard /></div> */}

                                                        </>
                                                    }
                                                </div>)
                                                    : tournament_list[0].game_id === 4 ? (<div className='col-12' style={{ border: '1px solid #34383e', padding: '25px' }}>
                                                        {activeTab === "how?" &&
                                                            <>
                                                                <div className="col-12" >
                                                                    <h4 className="tt-uppercase mb-3">How It  <span className="color-base">Works?</span></h4>
                                                                </div>
                                                                <div className="col-12">
                                                                    <h6 className="color-base">Enter & Play :</h6>
                                                                    <p>Join the CGES.club Tic Tac Toe tournament and test your strategy in real-time matches against other players! </p>
                                                                    <h6 className="color-base">Win to Earn Points:</h6>
                                                                    <p>1. Each win earns you points — the more you win, the higher climb on the leaderboard.   </p>
                                                                    <p>2. losses do not contribute to your score.  </p>
                                                                    <h6 className="color-base">Auto Matchmaking:</h6>
                                                                    <p>1. Once you join the tournament, the platform will match you with other players automatically. </p>
                                                                    <p>2. No waiting or manual match setup needed.  </p>
                                                                    <h6 className="color-base">Play Anytime During the Event: </h6>
                                                                    <p>Matches can be played at any time while the tournament is live. Just log in & register tournament, get matched, and play!  </p>
                                                                    <h6 className="color-base"> Climb & Win Big :</h6>
                                                                    <p>Your rank depends on total points. Finish in the top ranks to earn platform coins and exclusive rewards!  </p>

                                                                </div>
                                                            </>
                                                        }
                                                        {activeTab === "rules" &&
                                                            <>
                                                                <div className="col-12" >
                                                                    <h4 className="tt-uppercase mb-3">Tournament <span className="color-base">Rules</span></h4>
                                                                </div>
                                                                <div className="col-12">
                                                                    <h6 className="color-base">Match Eligibility :</h6>
                                                                    <p>1. Open to all registered CGES.club users.  <br />
                                                                        2. Fair gameplay is expected at all times.</p>
                                                                    <h6 className="color-base">Match Rules:</h6>
                                                                    <p>1. Each match is a standard Tic Tac Toe game (3x3 grid).<br /> 2. Players alternate turns; first to align 3 symbols (X or O) in a row, column, or diagonal wins.</p>   
                                                                    <h6 className="color-base">Game Format:</h6>
                                                                    <p>1. Matches are 1v1 and time-limited

                                                                        <br />
                                                                        2. Inactivity may result in auto-loss.</p>

                                                                    <h6 className="color-base">Points Allocation:</h6>
                                                                    <p>1. Win: +2 points <br />
                                                                        2. Draw: 1 points <br />
                                                                        3. Loss: 0 points</p>

                                                                    <h6 className="color-base">Tiebreakers :</h6>
                                                                    <p>If multiple players have the same score, their win/loss ratio and match completion time may be used as tiebreakers.  </p>
                                                                    <h6 className="color-base">Fair Play Policy :</h6>
                                                                    <p>1. No automation, scripting, or external aids allowed. <br />
                                                                        2. Players found violating rules will be disqualified and banned.</p>
                                                                    <h6 className="color-base">Agreement to Rules :</h6>
                                                                    <p>By joining the tournament,  you agree to all CGES.club tournament rules, terms, and conditions.  </p>
                                                                </div>
                                                            </>
                                                        }
                                                        {activeTab === "scoring" &&
                                                            <>
                                                                <div className="col-12" >
                                                                    <h4 className="tt-uppercase mb-3">Scoring  <span className="color-base">System</span></h4>
                                                                </div>
                                                                <div className="col-12">

                                                                    <p>The scoring is simple and encourages consistent wins. Only victories help you climb the leaderboard.  </p>
                                                                    <div className="table-responsive">

                                                                        <table className="table table-bordered text-center" style={{ color: '#fff' }}>
                                                                            <thead className="thead-dark">
                                                                                <tr>
                                                                                    <th> Result </th>
                                                                                    <th>Points Earned </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td><strong>Win </strong></td>
                                                                                    <td>2 Points</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td><strong>Draw </strong></td>
                                                                                    <td>1 Points</td>
                                                                                </tr>
                                                                                <tr> <td><strong>Lose </strong></td>
                                                                                    <td>0</td>
                                                                                </tr>

                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                    <h6 className="color-base">Example Score Calculation :</h6>
                                                                    <p>
                                                                        ✔ You played 7 matches <br />
                                                                        ✔ 5 Wins × 2 Points = 10 Points <br />
                                                                        ✔ 2 Losses = 0 Points <br />
                                                                        <br />
                                                                        <strong>Total Score = 10 Points</strong> <br />
                                                                        Keep winning matches to increase your score and top the leaderboard!
                                                                    </p>
                                                                </div>
                                                            </>
                                                        }
                                                        {activeTab === "leaderboard" &&
                                                            <>
                                                                <div className=" rounded position-relative" ><EventLeaderboard data={tournament_list} /></div>
                                                                {/* <div className=" border rounded position-relative" ><LeaderBoard /></div> */}

                                                            </>
                                                        }
                                                    
                                                </div>):tournament_list[0].game_id === 5 ? (<div className='col-12' style={{ border: '1px solid #34383e', padding: '25px' }}>
                                                    {activeTab === "how?" &&
                                                        <>
                                                          <div className="col-12" >
                                                        <h4 className="tt-uppercase mb-3">How It  <span className="color-base">Works?</span></h4>
                                                    </div>
                                                    <div className="col-12">
                                                        <h6 className="color-base">Enter & Race :</h6>
                                                        <p>Join the MR RACER Endless Mode Tournament and show your driving skills! Compete in endless races and earn points based on your overtakes.</p>
                                                        <h6 className="color-base">Earn Points with Every Overtake :</h6>
                                                        <p>1. Your overtake score determines your tournament points — the more overtakes, the higher you climb on the leaderboard.</p>
                                                        <p>2. Only overtake points are counted toward your ranking — crashes or distance don’t affect your score.</p>
                                                        <h6 className="color-base">Auto Participation :</h6>
                                                        <p>1. Simply join the tournament and race — your gameplay in Endless Mode will automatically count toward your score.</p>
                                                        <p>2. No need for manual match setup — just race, overtake, and earn!</p>
                                                        <h6 className="color-base">Play Anytime During the Event:</h6>
                                                        <p>You can play anytime while the tournament is live. Just log in, start Endless Mode, and your total overtake scores will be recorded automatically.</p>
                                                        <h6 className="color-base">Climb & Win Big:</h6>
                                                        <p>Your rank depends on your total overtake points. Finish among the top racers to win platform coins, exclusive rewards, and ultimate bragging rights on the leaderboard!</p>

                                                    </div>
                                                        </>
                                                    }
                                                    {activeTab === "rules" &&
                                                        <>
                                                            <div className="col-12" >
                                                                <h4 className="tt-uppercase mb-3">Tournament <span className="color-base">Rules</span></h4>
                                                            </div>
                                                            <div className="col-12">
                                                                <h6 className="color-base">Match Eligibility :</h6>
                                                                <p>1. Open to all registered CGES.club players.<br />
                                                                    2. Fair gameplay is expected from you at all times.</p>
                                                                <h6 className="color-base">Match Rules:</h6>
                                                                <p>1. Each match is an Endless Mode race in MR RACER.<br /> 2. Players must focus on overtaking as many vehicles as possible to earn points.</p>
                                                                <h6 className="color-base">Game Format:</h6>
                                                                <p>1. The tournament is solo-based and take maximum overtakes as much as possible.

                                                                    <br />
                                                                    2. You can play multiple races during the event period. Inactivity or failure to submit valid game data may result in no score being recorded.</p>

                                                                <h6 className="color-base">Points Allocation:</h6>
                                                                <p>1. Overtake Points: Each valid overtake adds to your total score. <br />
                                                                    2. Final Ranking: Determined based on your total overtake points accumulated during the tournament.</p>

                                                                <h6 className="color-base">Tiebreakers :</h6>
                                                                <p>If multiple players have the same score, their win/loss ratio and match completion time may be used for ranking.</p>
                                                                
                                                                <h6 className="color-base">Fair Play Policy :</h6>
                                                                <p>1. Use of hacks, automation tools, or modified game clients is strictly prohibited. <br />
                                                                    2. Any detected unfair activity will lead to instant disqualification and account ban.<br/>3. The CGES.club team reserves the right to review gameplay data for authenticity.</p>
                                                                <h6 className="color-base">Agreement to Rules :</h6>
                                                                <p>By joining the tournament,  you agree to all CGES.club tournament rules, terms, and conditions.  </p>
                                                            </div>
                                                        </>
                                                    }
                                                    {activeTab === "scoring" &&
                                                        <>
                                                            <div className="col-12" >
                                                                <h4 className="tt-uppercase mb-3">Scoring  <span className="color-base">System</span></h4>
                                                            </div>
                                                            <div className="col-12">

                                                                <p>The scoring is simple — more overtakes mean higher ranks! Your leaderboard position depends entirely on your overtake points earned during the tournament.</p>
                                                                <div className="table-responsive">

                                                                    <table className="table table-bordered text-center" style={{ color: '#fff' }}>
                                                                        <thead className="thead-dark">
                                                                            <tr>
                                                                                <th> Result </th>
                                                                                <th>Points Earned </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td><strong>Each Overtake</strong></td>
                                                                                <td>1 Point</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td><strong>Crash / Game Over </strong></td>
                                                                                <td>No additional points</td>
                                                                            </tr>
                                                                            
                                                                        
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                <h6 className="color-base">Example Score Calculation :</h6>
                                                                <p>
                                                                    ✔ You played 3 Endless races <br />
                                                                    ✔ Race 1: 120 Overtakes = 120 Points <br />
                                                                    ✔ Race 2: 180 Overtakes = 180 Points <br />\
                                                                    ✔ Race 3: 90 Overtakes = 90 Points <br />
                                                                    <br />
                                                                    <strong>Total Score = 390 Points</strong> <br />
                                                                    Keep racing, overtaking, and improving your best score to climb to the top of the MR RACER leaderboard and win exciting rewards!
                                                                </p>
                                                            </div>
                                                        </>
                                                    }
                                                    {activeTab === "leaderboard" &&
                                                        <>
                                                            <div className=" rounded position-relative" ><EventLeaderboard data={tournament_list} /></div>
                                                            {/* <div className=" border rounded position-relative" ><LeaderBoard /></div> */}

                                                        </>
                                                    }
                                                </div>) : null)}

                                    </div>
                                    <div className="row">
                                        {/* <div className="col-12">
                                            <h4 className="tt-uppercase mb-3">Game <span className="color-base">Info</span></h4>
                                        </div> */}
                                        {/* <div className="col-lg-4 col-md-6">
                                            <div className="game-info bg-box border-box border-radius-10 p-4 mb-4">
                                                <div className="d-flex align-self-center justify-content-between mb-5">
                                                    <img src="assets/img/icon/8.avif" alt="img" />
                                                    <div className="img">
                                                        <img src="assets/img/icon/11.avif" alt="img" />
                                                    </div>
                                                </div>
                                                <h4 className="mb-1">Team size</h4>
                                                <span className="color-base">4 player</span>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-6">
                                            <div className="game-info bg-box border-box border-radius-10 p-4 mb-4">
                                                <div className="d-flex align-self-center justify-content-between mb-5">
                                                    <img src="assets/img/icon/8.avif" alt="img" />
                                                    <div className="img">
                                                        <img src="assets/img/icon/11.avif" alt="img" />
                                                    </div>
                                                </div>
                                                <h4 className="mb-1">Team size</h4>
                                                <span className="color-base">4 player</span>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-6">
                                            <div className="game-info bg-box border-box border-radius-10 p-4 mb-4">
                                                <div className="d-flex align-self-center justify-content-between mb-5">
                                                    <img src="assets/img/icon/8.avif" alt="img" />
                                                    <div className="img">
                                                        <img src="assets/img/icon/11.avif" alt="img" />
                                                    </div>
                                                </div>
                                                <h4 className="mb-1">Team size</h4>
                                                <span className="color-base">4 player</span>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>


                            <div className="col-lg-4 col-sm-10 pe-xl-5 mt-lg-0 mt-4">
                                <div align="center">
                                    <div className="widget widget-trending-match">
                                        <h3 className="title" style={{ textAlign: 'center' }}>Invite Friends</h3>
                                        <ul>
                                            <li>
                                                <div className="thumb" style={{ border: 'none', background: 'none', margin: "auto" }}>
                                                    {/* <a href={`https://api.whatsapp.com/send/?text=https://cges.club/tournaments/${event_id}/${game_id}`} target='_blank' rel='noreferrer'><i className="fa-brands fa-whatsapp fa-2xl"></i></a> &nbsp;&nbsp;&nbsp; */}
                                                    <a
                                                        href={`https://api.whatsapp.com/send/?text=${encodeURIComponent(`🎮 Join the tournament now! Show your skills and win big! 🏆 Register here: https://cges.club/tournaments/${event_id}/${game_id}`)}`}
                                                        target='_blank'
                                                        rel='noreferrer'>
                                                        <i className="fa-brands fa-whatsapp fa-2xl"></i>
                                                    </a> &nbsp;&nbsp;&nbsp;
                                                    <a href={`https://www.facebook.com/sharer/sharer.php?u=https://cges.club/tournaments/${event_id}/${game_id}`} target='_blank' rel='noreferrer'><i className="fa-brands fa-facebook fa-2xl"></i></a>&nbsp;&nbsp;&nbsp;
                                                    <a href='https://discord.gg/RrY3FjVVfA' target='_blank' rel='noreferrer'><i className="fa-brands fa-discord fa-2xl"></i></a>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    {recent_participants_data?.length > 0 ? (
                                        <div className="">
                                            {/* <div className="widget widget-tournament-contact">
                                    <div className="border-bottom-1 pb-2 mb-4">
                                        <h3 className="border-left-base tt-uppercase ps-3 mobile-medium"><span className="color-base">CHECK</span> Home Enquiry</h3>
                                    </div>
                                    <form>
                                        <div className="single-input-inner style-border style-bg">
                                            <label className="mb-2">Your Name *</label>
                                            <input type="text" placeholder="Name" />
                                        </div>
                                        <div className="single-input-inner style-border style-bg">
                                            <label className="mb-2">Email *</label>
                                            <input type="text" placeholder="Email" />
                                        </div>
                                        <div className="single-input-inner style-border style-bg">
                                            <label className="mb-2">Phone *</label>
                                            <input type="text" placeholder="Phone" />
                                        </div>
                                        <div className="single-input-inner style-border style-bg">
                                            <label className="mb-2">Your Inquiry *</label>
                                            <textarea placeholder="Message"></textarea>
                                        </div>
                                        <div className="check d-flex align-self-start mb-3">
                                            <label>
                                                <input className="me-2" type="checkbox" />
                                                * I agree with Terms of Service.
                                            </label>
                                        </div>
                                        <button type="submit" className="btn btn-base border-radius-0 w-100 mt-2">Submit Enquiry</button>
                                    </form>
                                </div> */}
                                            <div className="widget widget-trending-match">
                                                <h3 className="title">RECENT PARTICIPANTS</h3>
                                                <ul>
                                                    {recent_participants_data.map((item, order) => {
                                                        return (
                                                            <>
                                                                <li key={item.user_id || order}>
                                                                    <div className="thumb">
                                                                        {item.profile_pic !== undefined && item.profile_pic !== null ? (
                                                                            <img src={`../../assets/img/profile_avatar/${item.profile_pic}.avif`} alt="img" style={{ maxWidth: "60px", borderRadius: "50%" }} />
                                                                        ) : (
                                                                            <img src='../../assets/img/profile_avatar/0.avif' alt="img" style={{ maxWidth: "60px", borderRadius: "50%" }} />
                                                                        )}
                                                                    </div>
                                                                    <div className="details">
                                                                        <h4>{item.player_name}</h4>
                                                                        {/* <span className="color-base"><img src="assets/img/1.avif" alt="img" /> $15000</span> */}
                                                                        {/* <span className="right-icon">50 points</span> */}
                                                                    </div>
                                                                </li>
                                                            </>
                                                        );
                                                    })}

                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        <></>
                                        // <center><h3>Tournament info not Available!</h3></center>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <center><h3>Tournament info not Available!</h3></center>
            )}
        </>
    );

}
export default TournamentDetails;

// close button when tournament is end to apply above.
