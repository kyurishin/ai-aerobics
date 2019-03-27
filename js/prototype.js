function startPrediction(){doPrediction=!0,consoleDebug&&console.log("start prediction"),select("#status").html("start prediction")}function clearLabel(e){knnClassifier.clearLabel(e),updateCounts()}function clearAllLabels(){knnClassifier.clearAllLabels(),updateCounts()}function saveModel(){consoleDebug&&console.log("saving knnClassifier"),knnClassifier.save("knn_model_"+getTimeStamp()),select("#status").html("knnClassifier model saved")}function loadDataset(){knnClassifier.load("./assets/model.json",updateCounts),consoleDebug&&console.log("loaded knnClassifier"),select("#status").html("knnClassifier model loading")}function addExample(e){if(poses.length>0){var t=poses[selectedPosId].pose.keypoints.map(e=>[e.score,e.position.x,e.position.y]);knnClassifier.addExample(t,e),updateCounts()}}function modelReady(){}function classify(){if(knnClassifier.getNumLabels()<=0)console.error("There is no examples in any label");else if(poses.length>0){var e=poses[selectedPosId].pose.keypoints.map(e=>[e.score,e.position.x,e.position.y]);knnClassifier.classify(e,gotResults),waitingForResult=!0}else consoleDebug&&console.log("no pose to classify")}function gotResults(e,t){if(e&&console.error(e),t.confidencesByLabel){var o=t.confidencesByLabel;t.label&&(select("#result").html(t.label),select("#confidence").html(`${100*o[t.label]} %`));for(let e=0;e<classId.length;e++)select("#confidence"+classId[e]).html(`${o[classId[e]]?100*o[classId[e]]:0} %`),confLevels[e]=100*o[classId[e]]}waitingForResult=!1}function updateCounts(){var e=knnClassifier.getCountByLabel();for(let t=0;t<classId.length;t++)select("#example"+classId[t]).html(e[classId[t]]||0)}var video,poseDebugDraw=!1,selectedPosDraw=!0,trainingView=!1,excludeFace=!0,knnClassifier=ml5.KNNClassifier();let poseNet,poses=[],poseNetOptions={imageScaleFactor:.1,outputStride:8,flipHorizontal:!0,minConfidence:0,maxPoseDetections:0,detectionType:"multi",multiplier:.5};var cnv,videoCanvas,canvasW=960,canvasH=720,outerFrame=30,cameraResW=640,cameraResH=480,doPrediction=!1,waitingForResult=!1,isFreaze=!1,selectedPosId=0,lastMillis=0,frameRateCounter=0,frameRateCount=0,classId=["Z","A","B","C","D","E"],confLevels=[],userMode=0,sequenceStep=0,sequenceTotalSteps=4;let conf=0;var trainingClass,videoFrameCount=0,loopFrameCount=0,doTraining=!1,videoIsRunning=!1,trainingPoseScoreThreshold=.7,imagePath="assets/imgSet1/";function preload(){}function setup(){noLoop()}function startP5(){consoleDebug&&console.log("start setup");for(let e=0;e<classId.length;e++)confLevels[e]=0;consoleDebug&&console.log("init camera"),(videoCanvas=createCanvas(cameraResW,cameraResH)).parent("videoContainer"),(video=createCapture(VIDEO)).size(cameraResW,cameraResH),video.hide(),consoleDebug&&console.log("init display canvas"),(cnv=createCanvas(canvasW,canvasH)).style("z-index","-1"),centerCanvas(),centerOverlay(),consoleDebug&&console.log("init posNet"),initPoseNet(),drawDomDebug&&$(".debugText").each(function(){$(this).css("display","block")}),trainingView?$("#trainingDiv").load("js/prototype/trainAndDebug/trainingsDiv.html"):(consoleDebug&&console.log("load model and start prediction"),loadDataset(),startPrediction()),preloadOverlayImg(),loop()}function initPoseNet(){select("#status").html("init openPosNet"),null!=poseNet&&(poses=[],poseNet.removeAllListeners()),(poseNet=ml5.poseNet(video,modelReady,poseNetOptions)).on("pose",function(e){poses=e})}function draw(){drawDomDebug&&printFrameRate(),videoIsRunning&&(loopFrameCount++,drawDomDebug&&(document.getElementById("debug3").innerHTML="loop-frames: "+loopFrameCount+"; video-frames: "+int(25*video.time())),video.time()==video.duration()&&stopVideo()),translate(width,0),scale(-1,1),null!=video&&(tint(255,255),image(video,0,0,width,height),filter(GRAY)),poses.length>0?(drawDomDebug&&(document.getElementById("debug1").innerHTML="poses detected: "+poses.length),selectedPosId=getCenterPos(),excludeFace&&removeBodyPartsFromPose(selectedPosId),selectedPosDraw&&drawSelectedPose(selectedPosId),poseDebugDraw&&drawOtherPoses(selectedPosId),doTraining&&(poses[selectedPosId].pose.score>=trainingPoseScoreThreshold&&(consoleDebug&&console.log("adding class: "+trainingClass),addExample(trainingClass)),videoFrameCount++),1==doPrediction&&0==waitingForResult&&classify()):drawDomDebug&&(document.getElementById("debug1").innerHTML="no pose detected"),translate(width,0),scale(-1,1),sequence()}function windowResized(){centerCanvas(),centerOverlay()}function centerCanvas(){var e=(windowWidth-width)/2,t=(windowHeight-height)/2;cnv.position(e,t)}function centerOverlay(){$("#overlayImage").css("width",width+2*outerFrame+"px"),$("#overlayImage").css("height",height+2*outerFrame+"px"),$("#overlayImage").css("left",cnv.position().x-outerFrame),$("#overlayImage").css("top",cnv.position().y-outerFrame)}function getCenterPos(){var e=0,t=cameraResW/2;for(let r=0;r<poses.length;r++){var o=0,s=0;let a=poses[r].pose;for(let e=0;e<a.keypoints.length;e++){let t=a.keypoints[e];t.score>.2&&(o+=t.position.x,s++)}var n=abs(o/s-cameraResW/2);n<t&&(t=n,e=r)}return drawDomDebug&&(document.getElementById("debug2").innerHTML="selected pose score: "+poses[e].pose.score.toFixed(2)),e}function removeBodyPartsFromPose(e){let t=poses[e];var o=["nose","leftEye","rightEye","leftEar","rightEar","leftKnee","rightKnee","leftAnkle","rightAnkle"];let s=t.pose.keypoints,n=[];for(let e=0;e<s.length;e++){let t=s[e].part;for(var r=!1,a=0,i=o.length;a<i;a++)if(-1!==t.indexOf(o[a])){r=!0;break}r||append(n,s[e])}t.pose.keypoints=n,poses[e]=t}function drawSelectedPose(e){let t,o,s,n,r=poses[e].skeleton;noFill(),100===conf?stroke(255,82,30):stroke(255,255,255),strokeWeight(10);for(let e=0;e<r.length;e++){let a=r[e][0],i=r[e][1];if(videoIsRunning)line(a.position.x,a.position.y,i.position.x,i.position.y);else{let e=a.position.x*(canvasW/cameraResW),r=i.position.x*(canvasW/cameraResW),l=a.position.y*(canvasW/cameraResW),c=i.position.y*(canvasW/cameraResW),p=(e+r)/2,d=(l+c)/2,u=.66*e+.33*r,m=.66*l+.33*c,g=.33*e+.66*r,f=.33*l+.66*c,v=.75*e+.25*r,h=.75*l+.25*c,S=.25*e+.75*r,x=.25*l+.75*c,b=map(conf,0,100,30,0);if("leftShoulder"===a.part&&"rightShoulder"===i.part||"leftShoulder"===i.part&&"rightShoulder"===a.part||"leftHip"===a.part&&"rightHip"===i.part||"leftHip"===i.part&&"rightHip"===a.part||"leftHip"===a.part&&"leftShoulder"===i.part||"leftHip"===i.part&&"leftShoulder"===a.part||"rightHip"===a.part&&"rightShoulder"===i.part||"rightHip"===i.part&&"rightShoulder"===a.part){if("leftShoulder"===a.part&&"rightShoulder"===i.part||"leftShoulder"===i.part&&"rightShoulder"===a.part)beginShape(),curveVertex(e,l),curveVertex(e,l),curveVertex(random(v-b,v+b),random(h-b,h+b)),curveVertex(random(v-b,v+b),random(h-b,h+b)),curveVertex(p,d),curveVertex(p,d),endShape(),beginShape(),curveVertex(r,c),curveVertex(r,c),curveVertex(random(S-b,S+b),random(x-b,x+b)),curveVertex(random(S-b,S+b),random(x-b,x+b)),curveVertex(p,d),curveVertex(p,d),endShape(),t=(e+r)/2,o=(l+c)/2;else if("leftHip"===a.part&&"rightHip"===i.part||"leftHip"===a.part&&"rightHip"===i.part){beginShape(),curveVertex(e,l),curveVertex(e,l),curveVertex(random(v-b,v+b),random(h-b,h+b)),curveVertex(random(v-b,v+b),random(h-b,h+b)),curveVertex(p,d),curveVertex(p,d),endShape(),beginShape(),curveVertex(r,c),curveVertex(r,c),curveVertex(random(S-b,S+b),random(x-b,x+b)),curveVertex(random(S-b,S+b),random(x-b,x+b)),curveVertex(p,d),curveVertex(p,d),endShape();let a=.66*t+.33*(s=(e+r)/2),i=.66*o+.33*(n=(l+c)/2),u=.33*t+.66*s,m=.33*o+.66*n;beginShape(),curveVertex(t,o),curveVertex(t,o),curveVertex(random(a-b,a+b),random(i-b,i+b)),curveVertex(random(a-b,a+b),random(i-b,i+b)),curveVertex(random(g-b,u+b),random(m-b,m+b)),curveVertex(random(g-b,u+b),random(m-b,m+b)),curveVertex(s,n),curveVertex(s,n),endShape()}}else beginShape(),curveVertex(e,l),curveVertex(e,l),curveVertex(random(u-b,u+b),random(m-b,m+b)),curveVertex(random(u-b,u+b),random(m-b,m+b)),curveVertex(random(g-b,g+b),random(f-b,f+b)),curveVertex(random(g-b,g+b),random(f-b,f+b)),curveVertex(r,c),curveVertex(r,c),endShape()}}}function drawOtherPoses(e){drawKeypoints(e),drawSkeleton(e)}function drawKeypoints(e){fill(255,255,0),noStroke();for(let t=0;t<poses.length;t++)if(t!=e){let e=poses[t].pose;for(let t=0;t<e.keypoints.length;t++){let o=e.keypoints[t];o.score>.2&&ellipse(o.position.x,o.position.y,5,5)}}}function drawSkeleton(e){stroke(255,255,0),strokeWeight(1);for(let t=0;t<poses.length;t++)if(t!=e){let e=poses[t].skeleton;for(let t=0;t<e.length;t++){let o=e[t][0],s=e[t][1];line(o.position.x,o.position.y,s.position.x,s.position.y)}}}function printFrameRate(){if(frameRateCounter+=int(frameRate()),frameRateCount++,millis()>lastMillis+300){lastMillis=millis();var e=frameRateCounter/frameRateCount;document.getElementById("frameRate").innerHTML="fr: "+int(e),frameRateCounter=0,frameRateCount=0}}function getTimeStamp(){var e="",t=new Date;return e+=t.getFullYear()+"-",e+=t.getMonth()+1+"-",e+=t.getDate()+"-",e+=t.getHours()+"-",e+=t.getMinutes()+"-",e+=t.getSeconds()}var processStep=0,waitTime=0,lastTime=0,waitForFades=!0,lastMatch=0,minMatchTime=2e3,wasMatching=!1,freazeTime=1e3;function startSequence(e){consoleDebug&&console.log("start sequnece"),select("#status").html("start sequnece"),userMode=e,sequneceStep=0,processStep=1}function sequence(){if(conf=poses.length>0?confLevels[sequenceStep]:0,0==userMode)switch(processStep){case 0:break;case 1:consoleDebug&&console.log("processStep: 1"),waitForFades=!0,sequenceStep=0,showMe("#poseStart",500),fadeInNextSequenceStep(0),waitTime=5e3,lastTime=millis(),processStep++,consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep);break;case 2:lastTime+waitTime<millis()&&(waitForFades=!0,fadeInNextSequenceStep(++sequenceStep),processStep++,consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep));break;case 3:100==conf&&0==waitForFades&&(0==wasMatching?(wasMatching=!0,lastMatch=millis()):lastMatch+minMatchTime<millis()&&(freaze(),consoleDebug&&console.log("pose conf == 100%! freaze!"),setTimeout(function(){waitForFades=!0,wasMatching=!1,noFreaze(),++sequenceStep<=sequenceTotalSteps?fadeInNextSequenceStep(sequenceStep):processStep++,consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep)},freazeTime)));break;case 4:consoleDebug&&console.log("processStep:"+processStep),waitForFades=!0,sequenceStep=0,showMe("#poseLoop",500),fadeInNextSequenceStep(0),waitTime=5e3,lastTime=millis(),processStep++,consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep);break;default:consoleDebug&&console.log("processStep out of bounds, there is no switch case for this processStep ("+processStep+")")}else 1==userMode||consoleDebug&&console.log("userMode out of bounds, there is no sequence switch case for this userMode")}function fadeInNextSequenceStep(e){consoleDebug&&console.log("fade in Sequence-step "+e),0==userMode?(setTimeout(function(){$("#pose"+e).fadeIn(500)},0),setTimeout(function(){$("#pose"+e).fadeOut(500),waitForFades=!1},2e3),setTimeout(function(){nextOverLay(e)},600)):1==userMode?(waitForFades=!1,nextOverLay(e)):consoleDebug&&console.log("userMode out of bounds, there is no overLay fading style for this userMode")}function nextOverLay(e){$("#backImg").attr("src",$("#frontImg").attr("src")),$("#backImg").css("display","inline"),$("#frontImg").css("display","none"),$("#frontImg").attr("src",imagePath+"0"+e+".png"),$("#backImg").fadeOut(800),$("#frontImg").fadeIn(400)}function showMe(e,t){setTimeout(function(){$(e).fadeIn(t)},t),setTimeout(function(){$(e).fadeOut(t)},2300+t)}function preloadOverlayImg(){var e="";for(let t=0;t<=sequenceTotalSteps;t++)e=e.concat("<img src='"+imagePath+"0"+t+".png'>");$("#preloader").html(e)}function toggleFreaze(){isFreaze?(loop(),isFreaze=!1):(noLoop(),isFreaze=!0)}function freaze(){noLoop()}function noFreaze(){loop()}