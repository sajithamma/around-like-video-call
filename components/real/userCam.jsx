import style from './style.module.css';
import { useEffect, useState } from 'react';


export default function userCam(props) {

    const realStream = props.realStream;
    const user = props.user;
    const mediaType = props.mediaType;



    useEffect(() => {

        console.log('props: ' + props.novideo);

        $(document).ready(() => {


            if (user.videoTrack != undefined) {
                let newVideoDom = document.getElementById(props.id);

                newVideoDom.srcObject = new MediaStream([user.videoTrack.getMediaStreamTrack()]);

                newVideoDom.load();

                newVideoDom.play();

            }
            else {

                let newVideoDom = document.getElementById(props.id);

                newVideoDom.srcObject = null


            }


        })

    })

    return (<>


        <div className={style.vwrapper} title={props.novideo}>

            <video id={props.id} className={style.video}></video>

            <div className={style.controls}>
                <div className={style.name}>{props.id}</div>

            </div>
        </div>


    </>)
}