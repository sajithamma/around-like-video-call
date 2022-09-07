import style from '../components/real/style.module.css';
import RealTerrain from '../components/real/realTerrain';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'


export default function Index(props) {


    const router = useRouter()

    //@todo to get from the url or DB
    const STREAM_CHANNEL = props.channel || router.query.channel;

    const [isConnected, setIsConnected] = useState(false);

    //state to save joined status   
    const [youJoined, youJoin] = useState(false);

    const [joining, setJoining] = useState(false);

    const [youAudioMuted, setYouAudioMuted] = useState(false);
    const [youVideoMuted, setYouVideoMuted] = useState(false);


    //declar realStream object to handle agora.
    let realStream;

    const initConnect = () => {

        realStream.joinAudience(STREAM_CHANNEL);
        setIsConnected(true);

    }

    //To start streaming video/audio
    const makeHost = () => {

        setJoining(true);
        realStream.makeHost();

    }

    const muteAudio = () => {

        realStream.muteMyAudio();
        setYouAudioMuted(true);
    }

    const unmuteAudio = () => {

        realStream.unmuteMyAudio();
        setYouAudioMuted(false);
    }

    const muteVideo = () => {

        realStream.muteMyVideo();
        setYouVideoMuted(true);
    }

    const unmuteVideo = () => {

        realStream.unmuteMyVideo();
        setYouVideoMuted(false);
    }

    const leaveChannel = () => {

        let confirm = window.confirm("Leaving?");

        if (confirm === false) {
            return;
        }

        realStream.leave();
        youJoin(false);
        setIsConnected(false);

        window.location.reload();

    }



    //load RealStream related components
    useEffect(() => {


        //Assing the static object to the localscope.
        realStream = REALSTREAM;

        realStream.onLocalVideoReady = () => {

            let myvideo = document.getElementById("myvideo");
            realStream.playLocalVideo(myvideo);

            //make the joined status true
            youJoin(true);
            setJoining(false);

            //Go live directly
            realStream.publish();

        }

        realStream.onRemoteUserPublished = (user, media) => {

            console.log('New remote user: publish' + window.REALSTREAM.remoteUsers.length);

            renderRemoteVideos(document.getElementById("root"), user);
        }


        realStream.onRemoteUserUnPublished = (user, media) => {

            console.log('New remote user : unpublish');
            renderRemoteVideos(document.getElementById("root"), user);
        }

        realStream.onRemoteUserLeft = (user) => {

            console.log("REMOVED");

            let videoWrapperDom = document.getElementById(user.uid + '_wrapper');
            videoWrapperDom.parentNode.removeChild(videoWrapperDom);

        }

        const playerPromise = []; //to handle all player promise



        window.playerPromise = playerPromise;

        const renderRemoteVideos = (rootDom, newuser) => {

            console.log("rendering...");

            let realStream = window.REALSTREAM;

            console.log(realStream.remoteUsers.length);

            for (let i = 0; i < realStream.remoteUsers.length; i++) {

                console.log("looping for user: " + newuser.uid);

                let user = realStream.remoteUsers[i].user;

                //only process the new user
                if (user.uid != newuser.uid) {

                    continue;
                }

                console.log(user);

                let videoDom = document.getElementById(user.uid);

                let MediaTracks = [];


                if (user.videoTrack != undefined) {
                    console.log('VIDEO TRACK');
                    MediaTracks.push(user.videoTrack.getMediaStreamTrack());
                }

                if (user.audioTrack != undefined) {

                    console.log('AUDIO TRACK');
                    //MediaTracks.push(user.audioTrack.getMediaStreamTrack());
                    user.audioTrack.play();

                }


                console.log(videoDom);

                //IF new video element is found, no matter any track, show it
                if (videoDom == undefined) {

                    console.log('NO VIDEODOM, CREATING ONE');

                    console.log(MediaTracks);

                    let wrapperDiv = document.createElement('div');
                    wrapperDiv.setAttribute("id", realStream.remoteUsers[i].user.uid + '_wrapper');
                    wrapperDiv.classList.add(style.vwrapper);
                    $(wrapperDiv).draggable();

                    videoDom = document.createElement('video');
                    videoDom.classList.add(style.video);
                    videoDom.setAttribute("id", realStream.remoteUsers[i].user.uid);
                    videoDom.style.backgroundImage = 'url(https://picsum.photos/201)';


                    rootDom.appendChild(wrapperDiv);
                    wrapperDiv.appendChild(videoDom);

                    let nameWrapperDiv = document.createElement('div');
                    nameWrapperDiv.classList.add(style.controls);
                    wrapperDiv.appendChild(nameWrapperDiv);

                    let nameDiv = document.createElement('div');
                    nameWrapperDiv.appendChild(nameDiv);
                    nameDiv.classList.add(style.name);
                    nameDiv.innerHTML = realStream.remoteUsers[i].user.uid;


                }

                //if media tracks are not empty
                if (MediaTracks.length > 0) {

                    videoDom.srcObject = new MediaStream(MediaTracks);
                    videoDom.load();
                    playerPromise[i] = videoDom.play();

                    if (playerPromise[i] !== null) {
                        playerPromise[i].catch(() => { console.log('Cachted play runtime error'); })
                    }

                }



                let css_filter = "";
                //change to blur if no video track
                if (user.videoTrack == undefined) {

                    css_filter = "blur(10px)";

                }
                else {
                    css_filter = "blur(0)";


                }

                //Change to gray if no vidoe track
                if (user.audioTrack == undefined) {

                    css_filter = css_filter + " grayscale(100%)";

                }
                else {


                    css_filter = css_filter + " grayscale(0%)";


                }

                videoDom.style.filter = css_filter;




            } //end for loop


        }//end method remote videos



        //Make video, tools and the logo drabbgles
        $('.' + style.vwrapper).draggable();
        $('.' + style.logolink).draggable();
        $('.' + style.bgcontrol).draggable();


        //function to  change background color
        $('.' + style.color).click(function () {



            let bgcolor = $(this).attr('data-color');

            if (bgcolor != '#000000') {

                document.getElementById('terrain').style.display = 'none';
            }
            else {

                document.getElementById('terrain').style.display = 'block';
            }

            $('.' + style.mainwrapper).css('background-color', bgcolor);

        });



    });




    return (<>

        <div className={style.mainwrapper}>

            <RealTerrain />

            <div className={style.topbanner}>

                <a className={style.logolink}><img className={style.logo} src="/logolatest.png" /></a>

                <div className={style.bgcontrol}>


                    <span className={`${style.color} ${style.color0}`} data-color="#000000"></span>
                    <span className={`${style.color} ${style.color1}`} data-color="#00b140"></span>
                    <span className={`${style.color} ${style.color2}`} data-color="#1A056D" ></span>
                    <span className={`${style.color} ${style.color3}`} data-color="#7B0606"></span>
                    <span className={`${style.color} ${style.color4}`} data-color="#333238"></span>

                </div>

            </div>

            <div id="root" className={style.root}>


                {(isConnected === false) && <>

                    <div className={style.heading}>volcano
                        real stream.</div>
                    <div className={style.connect} onClick={initConnect}>Connect</div>

                </>}


                {(isConnected === true) && <>

                    <div className={style.vwrapper}>

                        <video data-state={youJoined.toString()} id="myvideo" className={style.video}

                            style={(youAudioMuted === true) ? { filter: "grayScale(100%)" } : { filter: "grayScale(0%)" }}>


                        </video>

                        <div className={style.controls}>
                            <div className={style.name} >You</div>

                            {(youJoined === true) &&

                                <>

                                    {(youAudioMuted === false) && <>

                                        <div className={style.control} onClick={muteAudio}><img src="/audiounmuted.png" /></div>

                                    </>}

                                    {(youAudioMuted === true) && <>

                                        <div className={style.control} onClick={unmuteAudio}><img src="/audiomuted.png" /></div>

                                    </>}

                                    {(youVideoMuted === false) && <>

                                        <div className={style.control} onClick={muteVideo}><img src="/videounmuted.png" /></div>

                                    </>}

                                    {(youVideoMuted === true) && <>

                                        <div className={style.control} onClick={unmuteVideo}><img src="/videomuted.png" /></div>

                                    </>}


                                    <div className={style.control} onClick={leaveChannel} ><img src="/leave.png" /></div>

                                </>
                            }


                            {(youJoined === false) &&

                                <>

                                    {(joining === false) && <>

                                        <div className={`${style.control} ${style.golive}`} onClick={makeHost} >Go Live</div>

                                    </>}

                                    {(joining === true) && <>

                                        <div className={`${style.control} ${style.golive} ${style.joining}`}>joining...</div>

                                    </>}



                                </>
                            }



                        </div>
                    </div>


                </>}




            </div>
        </div>

        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>

        <script src="/js/AgoraRTC_N-4.12.2.js"></script>
        <script src="/js/agoraVolcano.js"></script>

        <script>


            const REALSTREAM = new RealStream();
            window.REALSTREAM = REALSTREAM;

        </script>


    </>)
}

