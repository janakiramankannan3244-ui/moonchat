import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const ICE_SERVERS = { iceServers: [{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'}] };
const PEN_COLORS = ['#FFFFFF','#FF4D4D','#FFD700','#4DFF91','#4DC4FF','#FF4DFF','#FF8C00','#00FFD1'];
const VIRTUAL_BACKGROUNDS = [
  {id:'none',  label:'None',   style:'none'},
  {id:'space', label:'Space',  style:'linear-gradient(135deg,#0b0c2a,#1a1a4e)'},
  {id:'sunset',label:'Sunset', style:'linear-gradient(135deg,#f953c6,#b91d73,#ff6b35)'},
  {id:'forest',label:'Forest', style:'linear-gradient(135deg,#134e5e,#71b280)'},
  {id:'ocean', label:'Ocean',  style:'linear-gradient(135deg,#005c97,#363795)'},
  {id:'aurora',label:'Aurora', style:'linear-gradient(135deg,#00b4db,#0083b0,#5f0a87)'},
];
const FACE_FILTERS = [
  {id:'none',   label:'None',   css:'none'},
  {id:'warm',   label:'Warm',   css:'sepia(0.4) saturate(1.4) brightness(1.05)'},
  {id:'cool',   label:'Cool',   css:'saturate(0.8) hue-rotate(15deg) brightness(1.05)'},
  {id:'vivid',  label:'Vivid',  css:'saturate(2) contrast(1.1)'},
  {id:'noir',   label:'Noir',   css:'grayscale(1) contrast(1.2)'},
  {id:'cartoon',label:'Cartoon',css:'saturate(2.5) contrast(1.5) brightness(1.1)'},
];
const GESTURE_EMOJIS = {
  thumbsup:{emoji:'\uD83D\uDC4D',label:'Thumbs Up!'},
  heart:   {emoji:'\u2764\uFE0F', label:'Love!'},
  wave:    {emoji:'\uD83D\uDC4B',label:'Hey!'},
  airkiss: {emoji:'\uD83D\uDE18',label:'Muah!'},
};
const FLOAT_EMOJIS = ['\u2728','\uD83C\uDF1F','\uD83D\uDCAB','\u2B50','\uD83C\uDF89','\uD83C\uDF8A','\uD83D\uDC96','\uD83D\uDD25','\uD83C\uDF08','\uD83E\uDD8B'];
const getCallId = (a,b) => [a,b].sort().join('_');

const CSS = `
@keyframes vc-reaction-pop{0%{opacity:0;transform:scale(0.4) translateY(40px)}30%{opacity:1;transform:scale(1.2) translateY(-10px)}70%{opacity:1;transform:scale(1) translateY(0)}100%{opacity:0;transform:scale(0.8) translateY(-20px)}}
@keyframes vc-text-float{0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)}}
@keyframes vc-pulse{0%{opacity:.6;transform:scale(1)}100%{opacity:0;transform:scale(1.7)}}
@keyframes vc-fade-in{from{opacity:0}to{opacity:1}}
@keyframes vc-slide-up{from{transform:translateX(-50%) translateY(100%);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
@keyframes vc-slide-right{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes vc-emoji-drift{0%{opacity:0;transform:translateY(0) scale(.5)}20%{opacity:1;transform:translateY(-30px) scale(1)}100%{opacity:0;transform:translateY(-200px) scale(.8)}}
`;
let si=false;
function injectStyles(){if(si)return;si=true;const el=document.createElement('style');el.textContent=CSS;document.head.appendChild(el);}

function CtrlBtn({onClick,active,children,label,title}){
  const[hov,setHov]=useState(false);
  return(
    <button onClick={onClick} title={title}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{width:52,height:52,borderRadius:'50%',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1,background:active?'rgba(255,255,255,0.92)':hov?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.1)',transform:hov?'scale(1.1)':'scale(1)',transition:'all .18s',boxShadow:active?'0 0 0 2px rgba(255,255,255,0.5)':'none'}}>
      <span style={{fontSize:18,lineHeight:1}}>{children}</span>
      {label&&<span style={{fontSize:8,fontWeight:700,color:active?'#111':'rgba(255,255,255,0.8)',letterSpacing:.3,lineHeight:1}}>{label}</span>}
    </button>
  );
}

export default function VideoCall({myProfile,friend,isCaller,initialOffer,onEndCall}){
  injectStyles();
  const localVideoRef=useRef(null),remoteVideoRef=useRef(null),drawCanvasRef=useRef(null),containerRef=useRef(null);
  const peerConnRef=useRef(null),localStreamRef=useRef(null),signalSubRef=useRef(null),vcDataSubRef=useRef(null);
  const handsRef=useRef(null),cameraRef=useRef(null),drawingRef=useRef(false),currentStrokeRef=useRef([]);
  const allStrokesRef=useRef([]),floatIntervalRef=useRef(null),textInputRef=useRef(null),lastGestureRef=useRef({type:null,time:0});

  const[isMuted,setIsMuted]=useState(false);
  const[isCameraOn,setIsCameraOn]=useState(true);
  const[isFullScreen,setIsFullScreen]=useState(false);
  const[facingMode,setFacingMode]=useState('user');
  const[callStatus,setCallStatus]=useState('connecting');
  const[callDuration,setCallDuration]=useState(0);
  const[drawMode,setDrawMode]=useState(false);
  const[textMode,setTextMode]=useState(false);
  const[showARPanel,setShowARPanel]=useState(false);
  const[penColor,setPenColor]=useState('#FFFFFF');
  const[penSize,setPenSize]=useState(4);
  const[textOverlays,setTextOverlays]=useState([]);
  const[textInput,setTextInput]=useState('');
  const[pendingTextPos,setPendingTextPos]=useState(null);
  const[bgChoice,setBgChoice]=useState('none');
  const[faceFilter,setFaceFilter]=useState('none');
  const[blurBg,setBlurBg]=useState(false);
  const[floatingEmojis,setFloatingEmojis]=useState([]);
  const[reactions,setReactions]=useState([]);
  const[mediaPipeReady,setMediaPipeReady]=useState(false);
  const callId=getCallId(myProfile?.id,friend?.id);

  useEffect(()=>{if(callStatus!=='active')return;const t=setInterval(()=>setCallDuration(d=>d+1),1000);return()=>clearInterval(t);},[callStatus]);
  const fmtD=(s)=>`${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  useEffect(()=>{startCall();return()=>cleanup();},[]);

  async function startCall(){
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720},facingMode},audio:true});
      localStreamRef.current=stream;
      if(localVideoRef.current)localVideoRef.current.srcObject=stream;
      const pc=new RTCPeerConnection(ICE_SERVERS);
      peerConnRef.current=pc;
      stream.getTracks().forEach(t=>pc.addTrack(t,stream));
      pc.ontrack=e=>{if(remoteVideoRef.current)remoteVideoRef.current.srcObject=e.streams[0];setCallStatus('active');};
      pc.onicecandidate=async e=>{
        if(!e.candidate)return;
        await supabase.from('call_signals').insert({caller_id:myProfile.id,callee_id:friend.id,type:'ice_candidate',payload:e.candidate.toJSON()});
      };
      pc.onconnectionstatechange=()=>{
        if(pc.connectionState==='connected')setCallStatus('active');
        if(['failed','disconnected','closed'].includes(pc.connectionState))setCallStatus('ended');
      };
      setupSignaling(pc);
      if(isCaller){
        const offer=await pc.createOffer({offerToReceiveVideo:true,offerToReceiveAudio:true});
        await pc.setLocalDescription(offer);
        await supabase.from('call_signals').insert({caller_id:myProfile.id,callee_id:friend.id,type:'offer',payload:{sdp:offer.sdp,type:offer.type},status:'calling'});
      }else if(initialOffer){
        await pc.setRemoteDescription(new RTCSessionDescription(initialOffer.payload));
        const answer=await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await supabase.from('call_signals').insert({caller_id:friend.id,callee_id:myProfile.id,type:'answer',payload:{sdp:answer.sdp,type:answer.type},status:'connected'});
        setCallStatus('active');
      }
    }catch(err){console.error('VideoCall startCall error:',err);setCallStatus('ended');}
  }

  function setupSignaling(pc){
    signalSubRef.current=supabase.channel(`vc_sig_${callId}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'call_signals'},async(payload)=>{
        const d=payload.new;
        if(isCaller&&d.caller_id===myProfile.id&&d.type==='answer'){try{await pc.setRemoteDescription(new RTCSessionDescription(d.payload));setCallStatus('active');}catch{}}
        if(d.caller_id===friend.id&&d.type==='ice_candidate'){try{await pc.addIceCandidate(new RTCIceCandidate(d.payload));}catch{}}
        if(d.type==='end_call'&&(d.caller_id===friend.id||d.callee_id===friend.id)){cleanup();onEndCall();}
      }).subscribe();
  }

  useEffect(()=>{
    vcDataSubRef.current=supabase.channel(`vc_data_${callId}_${Date.now()}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'video_call_data'},(payload)=>{
        const d=payload.new;
        if(d.call_id!==callId||d.sender_id===myProfile?.id)return;
        if(d.type==='draw')renderRemoteStroke(d.payload);
        else if(d.type==='clear'){allStrokesRef.current=[];clearCanvas();}
        else if(d.type==='undo'){allStrokesRef.current=d.payload?.strokes||[];redrawAll();}
        else if(d.type==='text_overlay')setTextOverlays(p=>[...p,d.payload]);
        else if(d.type==='gesture')showReaction(d.payload.gesture);
      }).subscribe();
    return()=>{if(vcDataSubRef.current)supabase.removeChannel(vcDataSubRef.current);};
  },[callId,myProfile?.id]);

  const broadcast=useCallback(async(type,payload)=>{
    if(!myProfile?.id)return;
    try{await supabase.from('video_call_data').insert({call_id:callId,sender_id:myProfile.id,type,payload});}
    catch(e){console.warn('broadcast:',e);}
  },[callId,myProfile?.id]);

  function cleanup(){
    if(signalSubRef.current)supabase.removeChannel(signalSubRef.current);
    if(vcDataSubRef.current)supabase.removeChannel(vcDataSubRef.current);
    if(localStreamRef.current)localStreamRef.current.getTracks().forEach(t=>t.stop());
    if(peerConnRef.current)peerConnRef.current.close();
    if(floatIntervalRef.current)clearInterval(floatIntervalRef.current);
    if(handsRef.current)try{handsRef.current.close();}catch{}
    if(cameraRef.current)try{cameraRef.current.stop();}catch{}
    document.exitFullscreen?.().catch(()=>{});
  }

  const toggleMute=()=>{const t=localStreamRef.current?.getAudioTracks()[0];if(t){t.enabled=!t.enabled;setIsMuted(!t.enabled);}};
  const toggleCamera=()=>{const t=localStreamRef.current?.getVideoTracks()[0];if(t){t.enabled=!t.enabled;setIsCameraOn(t.enabled);}};

  const switchCamera=async()=>{
    const nf=facingMode==='user'?'environment':'user';setFacingMode(nf);
    try{
      const ns=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720},facingMode:nf},audio:false});
      const nvt=ns.getVideoTracks()[0];
      const sender=peerConnRef.current?.getSenders().find(s=>s.track?.kind==='video');
      if(sender)await sender.replaceTrack(nvt);
      const ov=localStreamRef.current?.getVideoTracks()[0];
      if(ov){ov.stop();localStreamRef.current?.removeTrack(ov);}
      localStreamRef.current?.addTrack(nvt);
      if(localVideoRef.current)localVideoRef.current.srcObject=localStreamRef.current;
    }catch(err){console.warn('Camera switch:',err);}
  };

  const toggleFullScreen=()=>{
    if(!document.fullscreenElement){containerRef.current?.requestFullscreen();setIsFullScreen(true);}
    else{document.exitFullscreen();setIsFullScreen(false);}
  };

  const endCall=async()=>{
    try{await supabase.from('call_signals').insert({caller_id:myProfile.id,callee_id:friend.id,type:'end_call',status:'ended'});}catch{}
    cleanup();onEndCall();
  };

  const getCP=(e)=>{
    const c=drawCanvasRef.current;if(!c)return{x:0,y:0};
    const r=c.getBoundingClientRect();
    const cx=e.touches?e.touches[0].clientX:e.clientX,cy=e.touches?e.touches[0].clientY:e.clientY;
    return{x:(cx-r.left)*(c.width/r.width),y:(cy-r.top)*(c.height/r.height)};
  };

  const onDrawStart=(e)=>{
    if(!drawMode)return;e.preventDefault();drawingRef.current=true;currentStrokeRef.current=[];
    const p=getCP(e);currentStrokeRef.current.push(p);
    const ctx=drawCanvasRef.current?.getContext('2d');if(ctx){ctx.beginPath();ctx.moveTo(p.x,p.y);}
  };
  const onDrawMove=(e)=>{
    if(!drawMode||!drawingRef.current)return;e.preventDefault();
    const p=getCP(e);currentStrokeRef.current.push(p);
    const ctx=drawCanvasRef.current?.getContext('2d');
    if(ctx){ctx.lineTo(p.x,p.y);ctx.strokeStyle=penColor;ctx.lineWidth=penSize;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
  };
  const onDrawEnd=async(e)=>{
    if(!drawMode||!drawingRef.current)return;e.preventDefault?.();drawingRef.current=false;
    if(currentStrokeRef.current.length<2)return;
    const stroke={points:currentStrokeRef.current,color:penColor,size:penSize};
    allStrokesRef.current.push(stroke);currentStrokeRef.current=[];
    await broadcast('draw',stroke);
  };

  const renderRemoteStroke=(stroke)=>{
    const ctx=drawCanvasRef.current?.getContext('2d');if(!ctx||!stroke?.points?.length)return;
    allStrokesRef.current.push(stroke);
    ctx.beginPath();ctx.moveTo(stroke.points[0].x,stroke.points[0].y);
    stroke.points.forEach(p=>ctx.lineTo(p.x,p.y));
    ctx.strokeStyle=stroke.color||'#fff';ctx.lineWidth=stroke.size||4;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
  };
  const clearCanvas=()=>{const c=drawCanvasRef.current;const ctx=c?.getContext('2d');if(ctx)ctx.clearRect(0,0,c.width,c.height);};
  const drawStroke=(stroke)=>{
    const ctx=drawCanvasRef.current?.getContext('2d');if(!ctx||!stroke?.points?.length)return;
    ctx.beginPath();ctx.moveTo(stroke.points[0].x,stroke.points[0].y);
    stroke.points.forEach(p=>ctx.lineTo(p.x,p.y));
    ctx.strokeStyle=stroke.color||'#fff';ctx.lineWidth=stroke.size||4;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
  };
  const redrawAll=()=>{clearCanvas();allStrokesRef.current.forEach(drawStroke);};
  const handleClear=async()=>{allStrokesRef.current=[];clearCanvas();await broadcast('clear',{});};
  const handleUndo=async()=>{
    if(!allStrokesRef.current.length)return;
    allStrokesRef.current.pop();redrawAll();
    await broadcast('undo',{strokes:allStrokesRef.current});
  };

  useEffect(()=>{
    const resize=()=>{
      const c=drawCanvasRef.current;if(!c)return;
      const par=c.parentElement;if(!par)return;
      const{width,height}=par.getBoundingClientRect();
      if(c.width!==Math.floor(width)||c.height!==Math.floor(height)){c.width=Math.floor(width);c.height=Math.floor(height);redrawAll();}
    };
    resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);
  },[]);

  const onVideoClick=(e)=>{
    if(drawMode||!textMode)return;
    const r=e.currentTarget.getBoundingClientRect();
    setPendingTextPos({x:((e.clientX-r.left)/r.width)*100,y:((e.clientY-r.top)/r.height)*100});
    setTextInput('');setTimeout(()=>textInputRef.current?.focus(),50);
  };
  const submitText=async()=>{
    if(!textInput.trim()||!pendingTextPos)return;
    const ov={id:Date.now().toString(),text:textInput.trim(),x:pendingTextPos.x,y:pendingTextPos.y,color:penColor};
    setTextOverlays(p=>[...p,ov]);setPendingTextPos(null);setTextInput('');
    await broadcast('text_overlay',ov);
  };

  useEffect(()=>{loadMediaPipe();},[]);
  const loadMediaPipe=async()=>{
    try{
      const loadScript=src=>new Promise((res,rej)=>{
        if(document.querySelector(`script[src='${src}']`)){res();return;}
        const s=document.createElement('script');s.src=src;s.crossOrigin='anonymous';s.onload=res;s.onerror=rej;document.head.appendChild(s);
      });
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
      if(!window.Hands)return;
      const hands=new window.Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
      hands.setOptions({maxNumHands:2,modelComplexity:1,minDetectionConfidence:.7,minTrackingConfidence:.5});
      hands.onResults(onGestureResults);handsRef.current=hands;
      const video=localVideoRef.current;
      if(video&&window.Camera){
        const cam=new window.Camera(video,{onFrame:async()=>{if(handsRef.current&&video.readyState>=2)await handsRef.current.send({image:video});},width:320,height:240});
        cam.start();cameraRef.current=cam;
      }
      setMediaPipeReady(true);
    }catch(err){console.warn('MediaPipe (non-critical):',err);}
  };

  const onGestureResults=useCallback(async(results)=>{
    if(!results.multiHandLandmarks?.length)return;
    const now=Date.now();const gesture=detectGesture(results.multiHandLandmarks);if(!gesture)return;
    if(gesture===lastGestureRef.current.type&&now-lastGestureRef.current.time<3000)return;
    lastGestureRef.current={type:gesture,time:now};showReaction(gesture);await broadcast('gesture',{gesture});
  },[broadcast]);

  const detectGesture=(hls)=>{
    if(!hls.length)return null;const lm=hls[0];
    const ext=(tip,pip)=>lm[tip].y<lm[pip].y;
    const tU=ext(4,3),iU=ext(8,6),mU=ext(12,10),rU=ext(16,14),pU=ext(20,18);
    if(tU&&!iU&&!mU&&!rU&&!pU)return'thumbsup';
    if(iU&&mU&&rU&&pU)return'wave';
    const pd=Math.hypot(lm[4].x-lm[8].x,lm[4].y-lm[8].y);if(pd<0.06&&!mU&&!rU)return'airkiss';
    if(hls.length>=2){const l2=hls[1];const d=Math.hypot(lm[4].x-l2[4].x,lm[4].y-l2[4].y);if(d<0.15)return'heart';}
    return null;
  };

  const showReaction=(gesture)=>{
    const id=Date.now().toString();
    setReactions(p=>[...p,{id,gesture}]);
    setTimeout(()=>setReactions(p=>p.filter(r=>r.id!==id)),3500);
  };

  useEffect(()=>{
    floatIntervalRef.current=setInterval(()=>{
      const emoji=FLOAT_EMOJIS[Math.floor(Math.random()*FLOAT_EMOJIS.length)];
      const id=Date.now().toString();const x=5+Math.random()*90;
      setFloatingEmojis(p=>[...p,{id,emoji,x}]);
      setTimeout(()=>setFloatingEmojis(p=>p.filter(e=>e.id!==id)),3500);
    },4500);
    return()=>clearInterval(floatIntervalRef.current);
  },[]);

  useEffect(()=>{
    const h=()=>setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange',h);return()=>document.removeEventListener('fullscreenchange',h);
  },[]);

  const curBg=VIRTUAL_BACKGROUNDS.find(b=>b.id===bgChoice);
  const curFilter=FACE_FILTERS.find(f=>f.id===faceFilter);
  const localFilter=curFilter?.css!=='none'?curFilter.css:undefined;
  const friendName=friend?.full_name||friend?.email?.split('@')[0]||'Caller';

  return(
    <div ref={containerRef} style={{position:'fixed',inset:0,zIndex:100,background:'#000',overflow:'hidden',fontFamily:"'Inter',sans-serif"}}>
      <video ref={remoteVideoRef} autoPlay playsInline style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
      {callStatus==='connecting'&&(
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:5,background:'linear-gradient(135deg,#0b0c2a,#1a1a4e)',animation:'vc-fade-in .4s ease'}}>
          <div style={{fontSize:64,marginBottom:16}}>📡</div>
          <div style={{color:'#fff',fontSize:20,fontWeight:700,marginBottom:8}}>Connecting to {friendName}...</div>
          <div style={{display:'flex',gap:6,marginTop:12}}>
            {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:'50%',background:'#4DC4FF',animation:`vc-pulse 1.2s ease-in-out ${i*.3}s infinite`}} />)}
          </div>
        </div>
      )}
      <canvas ref={drawCanvasRef}
        style={{position:'absolute',inset:0,zIndex:10,cursor:drawMode?'crosshair':textMode?'text':'default',pointerEvents:(drawMode||textMode)?'auto':'none'}}
        onMouseDown={onDrawStart} onMouseMove={onDrawMove} onMouseUp={onDrawEnd} onMouseLeave={onDrawEnd}
        onTouchStart={onDrawStart} onTouchMove={onDrawMove} onTouchEnd={onDrawEnd}
        onClick={onVideoClick}
      />
      {textOverlays.map(ov=>(
        <div key={ov.id} style={{position:'absolute',left:`${ov.x}%`,top:`${ov.y}%`,transform:'translate(-50%,-50%)',zIndex:15,color:ov.color||'#fff',fontSize:18,fontWeight:700,textShadow:'0 2px 12px rgba(0,0,0,.8)',animation:'vc-text-float 3s ease-in-out infinite',pointerEvents:'none',maxWidth:200,textAlign:'center',wordBreak:'break-word'}}>
          {ov.text}
        </div>
      ))}
      {pendingTextPos&&(
        <div style={{position:'absolute',left:`${pendingTextPos.x}%`,top:`${pendingTextPos.y}%`,transform:'translate(-50%,-50%)',zIndex:50,display:'flex',gap:6}}>
          <input ref={textInputRef} value={textInput} onChange={e=>setTextInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter')submitText();if(e.key==='Escape')setPendingTextPos(null);}}
            placeholder="Type text..."
            style={{background:'rgba(0,0,0,.75)',border:'1.5px solid rgba(255,255,255,.3)',borderRadius:8,color:'#fff',padding:'6px 12px',fontSize:14,outline:'none',backdropFilter:'blur(8px)',minWidth:160}}
          />
          <button onClick={submitText} style={{background:'#4DC4FF',border:'none',borderRadius:8,color:'#000',fontWeight:700,padding:'6px 12px',cursor:'pointer',fontSize:13}}>OK</button>
          <button onClick={()=>setPendingTextPos(null)} style={{background:'rgba(255,255,255,.15)',border:'none',borderRadius:8,color:'#fff',padding:'6px 10px',cursor:'pointer',fontSize:13}}>X</button>
        </div>
      )}
      {floatingEmojis.map(fe=>(
        <div key={fe.id} style={{position:'absolute',bottom:120,left:`${fe.x}%`,fontSize:28,zIndex:20,pointerEvents:'none',animation:'vc-emoji-drift 3.5s ease-out forwards'}}>{fe.emoji}</div>
      ))}
      {reactions.map(r=>{
        const g=GESTURE_EMOJIS[r.gesture];if(!g)return null;
        return(
          <div key={r.id} style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:60,textAlign:'center',pointerEvents:'none',animation:'vc-reaction-pop 3.5s ease-out forwards'}}>
            <div style={{fontSize:88,lineHeight:1}}>{g.emoji}</div>
            <div style={{color:'#fff',fontSize:18,fontWeight:800,textShadow:'0 2px 16px rgba(0,0,0,.8)',marginTop:10,letterSpacing:1}}>{g.label}</div>
          </div>
        );
      })}
      <div style={{position:'absolute',top:16,right:16,width:148,height:200,borderRadius:16,overflow:'hidden',border:'2px solid rgba(255,255,255,.18)',boxShadow:'0 8px 32px rgba(0,0,0,.55)',zIndex:30,background:curBg?.style!=='none'?curBg.style:'#111'}}>
        <video ref={localVideoRef} autoPlay playsInline muted style={{width:'100%',height:'100%',objectFit:'cover',transform:facingMode==='user'?'scaleX(-1)':'none',filter:localFilter,display:isCameraOn?'block':'none'}} />
        {!isCameraOn&&<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1a1a2e,#16213e)',fontSize:36}}>cam off</div>}
        {blurBg&&<div style={{position:'absolute',inset:0,backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',background:'rgba(0,0,0,.08)',pointerEvents:'none'}} />}
        <div style={{position:'absolute',bottom:6,left:0,right:0,textAlign:'center',color:'rgba(255,255,255,.8)',fontSize:10,fontWeight:600,textShadow:'0 1px 4px rgba(0,0,0,.8)'}}>You</div>
      </div>
      <div style={{position:'absolute',top:0,left:0,right:0,zIndex:40,padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'linear-gradient(to bottom,rgba(0,0,0,.7),transparent)'}}>
        <div>
          <div style={{color:'#fff',fontWeight:700,fontSize:18,textShadow:'0 2px 8px rgba(0,0,0,.8)'}}>{friendName}</div>
          <div style={{color:'rgba(255,255,255,.7)',fontSize:12,marginTop:2}}>
            {callStatus==='connecting'?'Connecting...':callStatus==='active'?`Live ${fmtD(callDuration)}`:'Call ended'}
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {mediaPipeReady&&<div style={{padding:'4px 10px',borderRadius:20,background:'rgba(77,196,255,.2)',border:'1px solid rgba(77,196,255,.4)',color:'#4DC4FF',fontSize:10,fontWeight:700}}>Gestures ON</div>}
          <div style={{padding:'4px 10px',borderRadius:20,background:'rgba(34,197,94,.2)',border:'1px solid rgba(34,197,94,.4)',color:'#4ade80',fontSize:10,fontWeight:700}}>HD Encrypted</div>
        </div>
      </div>
      {drawMode&&(
        <div style={{position:'absolute',bottom:90,left:'50%',transform:'translateX(-50%)',zIndex:50,animation:'vc-slide-up .25s ease',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',padding:'10px 16px',borderRadius:16,maxWidth:'92vw',background:'rgba(10,10,20,.8)',backdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,.12)'}}>
          {PEN_COLORS.map(c=><button key={c} onClick={()=>setPenColor(c)} style={{width:22,height:22,borderRadius:'50%',background:c,border:'none',cursor:'pointer',outline:penColor===c?'3px solid #fff':'2px solid transparent',outlineOffset:2,transition:'outline .12s'}} />)}
          <div style={{width:1,height:24,background:'rgba(255,255,255,.2)'}} />
          <span style={{fontSize:11,color:'#aaa'}}>Size</span>
          <input type="range" min={2} max={20} value={penSize} onChange={e=>setPenSize(Number(e.target.value))} style={{width:72,accentColor:'#4DC4FF'}} />
          <span style={{fontSize:12,color:'#fff',width:18}}>{penSize}</span>
          <div style={{width:1,height:24,background:'rgba(255,255,255,.2)'}} />
          <button onClick={handleUndo} style={{background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.2)',borderRadius:8,color:'#fff',padding:'5px 10px',cursor:'pointer',fontSize:12,fontWeight:600}}>Undo</button>
          <button onClick={handleClear} style={{background:'rgba(239,68,68,.2)',border:'1px solid rgba(239,68,68,.4)',borderRadius:8,color:'#f87171',padding:'5px 10px',cursor:'pointer',fontSize:12,fontWeight:600}}>Clear</button>
        </div>
      )}
      {showARPanel&&(
        <div style={{position:'absolute',top:70,right:0,bottom:90,width:200,zIndex:50,overflowY:'auto',padding:'14px 12px',background:'rgba(8,8,20,.88)',backdropFilter:'blur(20px)',borderLeft:'1px solid rgba(255,255,255,.1)',animation:'vc-slide-right .25s ease'}}>
          <div style={{marginBottom:14}}>
            <div style={{color:'#aaa',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Background</div>
            {VIRTUAL_BACKGROUNDS.map(bg=>(
              <button key={bg.id} onClick={()=>setBgChoice(bg.id)} style={{width:'100%',marginBottom:5,padding:'6px 10px',borderRadius:8,border:`1.5px solid ${bgChoice===bg.id?'#4DC4FF':'rgba(255,255,255,.1)'}`,background:bg.style!=='none'?bg.style:'rgba(255,255,255,.05)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer',textAlign:'left',textShadow:'0 1px 4px rgba(0,0,0,.8)'}}>{bg.label}</button>
            ))}
          </div>
          <div style={{marginBottom:14}}>
            <div style={{color:'#aaa',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>BG Blur</div>
            <button onClick={()=>setBlurBg(b=>!b)} style={{width:'100%',padding:'6px 10px',borderRadius:8,border:`1.5px solid ${blurBg?'#4DC4FF':'rgba(255,255,255,.1)'}`,background:blurBg?'rgba(77,196,255,.15)':'rgba(255,255,255,.05)',color:blurBg?'#4DC4FF':'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>{blurBg?'Blur ON':'Blur OFF'}</button>
          </div>
          <div>
            <div style={{color:'#aaa',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Face Filter</div>
            {FACE_FILTERS.map(f=>(
              <button key={f.id} onClick={()=>setFaceFilter(f.id)} style={{width:'100%',marginBottom:5,padding:'6px 10px',borderRadius:8,border:`1.5px solid ${faceFilter===f.id?'#FFD700':'rgba(255,255,255,.1)'}`,background:faceFilter===f.id?'rgba(255,215,0,.1)':'rgba(255,255,255,.05)',color:faceFilter===f.id?'#FFD700':'#fff',fontSize:12,fontWeight:600,cursor:'pointer',textAlign:'left'}}>{f.label}</button>
            ))}
          </div>
        </div>
      )}
      {(drawMode||textMode)&&(
        <div style={{position:'absolute',top:66,left:'50%',transform:'translateX(-50%)',zIndex:40,padding:'5px 14px',borderRadius:20,pointerEvents:'none',background:drawMode?'rgba(77,196,255,.22)':'rgba(255,215,0,.22)',border:`1.5px solid ${drawMode?'rgba(77,196,255,.5)':'rgba(255,215,0,.5)'}`,color:drawMode?'#4DC4FF':'#FFD700',fontSize:12,fontWeight:700,whiteSpace:'nowrap'}}>
          {drawMode?'Drawing Mode - draw anywhere on screen':'Text Mode - click anywhere to place text'}
        </div>
      )}
      <div style={{position:'absolute',bottom:18,left:'50%',transform:'translateX(-50%)',zIndex:40,display:'flex',alignItems:'center',gap:8,padding:'12px 18px',borderRadius:36,background:'rgba(10,10,20,.72)',backdropFilter:'blur(24px)',border:'1px solid rgba(255,255,255,.12)',boxShadow:'0 8px 40px rgba(0,0,0,.6)',flexWrap:'wrap',maxWidth:'95vw',justifyContent:'center'}}>
        <CtrlBtn onClick={toggleMute} active={isMuted} label={isMuted?'Unmute':'Mute'} title={isMuted?'Unmute mic':'Mute mic'}>{isMuted?'\uD83D\uDD07':'\uD83C\uDFA4'}</CtrlBtn>
        <CtrlBtn onClick={toggleCamera} active={!isCameraOn} label={isCameraOn?'Camera':'No Cam'} title="Toggle camera">{isCameraOn?'\uD83D\uDCF9':'\uD83D\uDCF5'}</CtrlBtn>
        <CtrlBtn onClick={switchCamera} label="Flip" title="Flip camera">{'\uD83D\uDD04'}</CtrlBtn>
        <CtrlBtn onClick={toggleFullScreen} active={isFullScreen} label={isFullScreen?'Exit':'Full'} title="Fullscreen">{isFullScreen?'exit':'full'}</CtrlBtn>
        <div style={{width:1,height:36,background:'rgba(255,255,255,.15)',margin:'0 2px'}} />
        <CtrlBtn onClick={()=>{setDrawMode(d=>!d);setTextMode(false);}} active={drawMode} label="Draw" title="Draw on screen">{'\u270F\uFE0F'}</CtrlBtn>
        <CtrlBtn onClick={()=>{setTextMode(t=>!t);setDrawMode(false);}} active={textMode} label="Text" title="Text overlay">T</CtrlBtn>
        <div style={{width:1,height:36,background:'rgba(255,255,255,.15)',margin:'0 2px'}} />
        <CtrlBtn onClick={()=>setShowARPanel(p=>!p)} active={showARPanel} label="AR" title="AR effects">AR</CtrlBtn>
        <div style={{width:1,height:36,background:'rgba(255,255,255,.15)',margin:'0 4px'}} />
        <button onClick={endCall} title="End call"
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.12)';}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';}}
          style={{width:58,height:58,borderRadius:'50%',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#ef4444,#b91c1c)',boxShadow:'0 4px 20px rgba(239,68,68,.55)',transition:'all .18s',color:'#fff',fontWeight:700,fontSize:13}}>
          END
        </button>
      </div>
    </div>
  );
}
