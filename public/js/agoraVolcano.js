const VOLCANO_AGORA_APP_ID = '81d99d5bc7ad4117a6023f4128abdb1f';

class RealStream {

    constructor(mode = 'live', codec = 'vp8') {

        AgoraRTC.setLogLevel(5);

        this.APP_ID = VOLCANO_AGORA_APP_ID;
        this.client = AgoraRTC.createClient({ mode: mode, codec: codec });

        //To keep track of ME's audio and video track
        this.localTracks = {

            videoTrack: null,
            audioTrack: null
        }

        this.remoteUsers = [];
        this.initBasicAgoraHandlers();

        //Object to save all client related option parameters
        this.options = { appid: this.APP_ID };

        this.onLocalVideoReady = () => { };
        this.onRemoteUserPublished = () => { };
        this.onRemoteUserUnPublished = () => { };
        this.onRemoteUserJoined = (user) => { };
        this.onRemoteUserLeft = (user) => { };

    }

    /**
     * 
     * @param {host or audience} role 
     * @param {name of the channel} channel 
     * @param {user id to pass} uid 
     * @param {auth token} token 
     */
    joinHost = async (channel, uid = null, token = null) => {

        this.options.channel = channel;
        this.options.uid = uid;
        this.options.token = token;

        this.client.setClientRole("host");

        //To handle remote user stream data when publish/unpublish
        this.client.on("user-published", this.handleUserPublished);
        this.client.on("user-unpublished", this.handleUserUnpublished);
        this.client.on("user-joined", this.handleUserJoined);


        [this.options.uid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([

            // Join the channel.
            this.client.join(this.options.appid, this.options.channel, this.options.token || null, this.options.uid || null),

            // Create tracks to the local microphone and camera.
            AgoraRTC.createMicrophoneAudioTrack(),
            AgoraRTC.createCameraVideoTrack()
        ]);


        //Trigger local video ready callback    
        this.onLocalVideoReady();

    }


    /**
     * 
     * @param {host or audience} role 
     * @param {name of the channel} channel 
     * @param {user id to pass} uid 
     * @param {auth token} token 
     */
    joinAudience = async (channel, uid = null, token = null) => {

        this.options.channel = channel;
        this.options.uid = uid;
        this.options.token = token;
        this.options.audienceLatency = 2;

        this.client.setClientRole("audience", { level: this.options.audienceLatency });

        //To handle remote user stream data when publish/unpublish
        this.client.on("user-published", this.handleUserPublished);
        this.client.on("user-unpublished", this.handleUserUnpublished);
        this.client.on("user-joined", this.handleUserJoined);
        this.client.on("user-left", this.handleUserLeft);


        this.options.uid = await this.client.join(this.options.appid, this.options.channel, this.options.token || null, this.options.uid || null);

    }

    makeHost = async () => {

        this.client.setClientRole("host");
        this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();

        setTimeout(() => { this.onLocalVideoReady(); }, 300)


    }

    /** 
     * To leave the channel and stop all streams
     */
    leave = async () => {

        for (let trackName in this.localTracks) {
            let track = this.localTracks[trackName];
            if (track) {
                track.stop();
                track.close();
                this.localTracks[trackName] = undefined;

            }
        }

        await this.client.leave();


    }

    /**
     * 
     * To start going live sending your stream 
     */
    publish = async () => {

        await this.client.publish(Object.values(this.localTracks));
    }

    //To subscribe to a remote user to view/listen
    subscribe = async (user, mediaType) => {

        const uid = user.uid;
        await this.client.subscribe(user, mediaType);

        this.updateRemoteUsers(user, mediaType);

        this.onRemoteUserPublished(user, mediaType)


    }

    updateRemoteUsers = (user, mediaType) => {



        for (let i = 0; i < this.remoteUsers.length; i++) {
            //If the user is already available
            if (this.remoteUsers[i].user.uid == user.uid) {

                this.remoteUsers[i].user = user;

                return;
            }

        }

        let realuser = { user: user };
        this.remoteUsers.push(realuser);

    }

    //When a new  remote user publish strean data to channel
    handleUserPublished = (user, mediaType) => {

        console.log('published');
        this.subscribe(user, mediaType);

    }

    //When a new remote user remove strean data to channel
    handleUserUnpublished = (user, mediaType) => {

        console.log('un published');
        this.onRemoteUserUnPublished(user, mediaType);

    }

    handleUserLeft = (user) => {

        for (let i = 0; i < this.remoteUsers.length; i++) {
            //If the user is already available
            if (this.remoteUsers[i].user.uid == user.uid) {


                this.remoteUsers.splice(i, 1);

            }

        }

        this.onRemoteUserLeft(user);

    }

    handleUserJoined = (user) => {

        //external call
        this.onRemoteUserJoined(user);

    }



    renderLocalVideos = () => {


    }


    muteMyAudio = async () => {

        if (!this.localTracks.audioTrack) return;
        await this.localTracks.audioTrack.setMuted(true);
    }

    unmuteMyAudio = async () => {

        if (!this.localTracks.audioTrack) return;
        await this.localTracks.audioTrack.setMuted(false);
    }

    muteMyVideo = async () => {

        if (!this.localTracks.videoTrack) return;
        await this.localTracks.videoTrack.setMuted(true);
    }

    unmuteMyVideo = async () => {

        if (!this.localTracks.videoTrack) return;
        await this.localTracks.videoTrack.setMuted(false);
    }

    //To get list of camera devices
    getCameras = async (callback) => {

        const camera_list = await AgoraRTC.getCameras();
        callback(camera_list);

    }

    getMicrophones = async (callback) => {

        const microphone_list = await AgoraRTC.getMicrophones();
        callback(microphone_list);

    }

    playLocalVideo = (videoDom) => {

        videoDom.srcObject = new MediaStream([this.localTracks.videoTrack.getMediaStreamTrack()]);
        videoDom.load();
        videoDom.play();
    }

    switchCamera = async (videoDom, deviceID) => {

        await this.localTracks.videoTrack.setDevice(deviceID);
        this.playLocalVideo(videoDom);
    }


    /**
     * 
     * @param {*} value  eg: 1080p_1, 1080p_2, 720p_1, 480p 
     * or even object { width: 200, height: 640, frameRate: 30 }
     */
    changeVideoQuality = async (value) => {

        this.localTracks.videoTrack && await this.localTracks.videoTrack.setEncoderConfiguration(value);

    }

    /**
     * 
     * To initiliase basic agora handlers
     * 
     */
    initBasicAgoraHandlers = () => {

        AgoraRTC.onAutoplayFailed = () => {
            alert("click to start autoplay!")
        }

        AgoraRTC.onMicrophoneChanged = async (changedDevice) => {
            // When plugging in a device, switch to a device that is newly plugged in.
            if (changedDevice.state === "ACTIVE") {
                this.localTracks.audioTrack.setDevice(changedDevice.device.deviceId);
                // Switch to an existing device when the current device is unplugged.
            } else if (changedDevice.device.label === this.localTracks.audioTrack.getTrackLabel()) {
                const oldMicrophones = await AgoraRTC.getMicrophones();
                oldMicrophones[0] && this.localTracks.audioTrack.setDevice(oldMicrophones[0].deviceId);
            }
        }

        AgoraRTC.onCameraChanged = async (changedDevice) => {
            // When plugging in a device, switch to a device that is newly plugged in.
            if (changedDevice.state === "ACTIVE") {
                this.localTracks.videoTrack.setDevice(changedDevice.device.deviceId);
                // Switch to an existing device when the current device is unplugged.
            } else if (changedDevice.device.label === this.localTracks.videoTrack.getTrackLabel()) {
                const oldCameras = await AgoraRTC.getCameras();
                oldCameras[0] && this.localTracks.videoTrack.setDevice(oldCameras[0].deviceId);
            }
        }

    }

}