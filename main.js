import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from  'https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/RGBELoader.js';
import { ARButton } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/webxr/ARButton.js';

			let hitTestSource = null;
			let hitTestSourceRequested = false;
            let renderer,scene,camera;
			let container;

function init(){

const webgl = document.querySelector('#webgl');
const width = webgl.offsetWidth;
const height = webgl.offsetHeight;
let model;
let shoes;

            scene = new THREE.Scene();
			 camera = new THREE.PerspectiveCamera( 60, width / height, 0.1, 1000 );

            renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true,canvas: webgl } );
			renderer.setSize( width, height);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.outputEncoding = THREE.sRGBEncoding;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.2;
            renderer.xr.enabled = true;

            document.body.appendChild( ARButton.createButton( renderer, { requiredFeatures: [ 'hit-test' ] } ) );


            const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
            scene.add( directionalLight );





			camera.position.set(0,3,6);




            const loader = new GLTFLoader();
            loader.load('poly.glb', function(gltf){
               model = gltf.scene;
          
             scene.add(model)
           
          const controller = renderer.xr.getController( 0 );
          controller.addEventListener( 'select', onSelect );
          scene.add( controller );

        const  reticle = new THREE.Mesh(
              new THREE.RingGeometry( 0.15, 0.2, 32 ).rotateX( - Math.PI / 2 ),
              new THREE.MeshBasicMaterial()
          );
          reticle.matrixAutoUpdate = false;
          reticle.visible = false;
          scene.add( reticle );


               function onSelect() {

                if ( reticle.visible ) {

                    reticle.matrix.decompose( model.position, model.quaternion, model.scale );
                    model.scale.y = Math.random() * 2 + 1;
                    scene.add( model );

                }

            }

      
            },
            
            )};
      
         function animate() {

            renderer.setAnimationLoop( render );

        }

        function render( timestamp, frame ) {

            if ( frame ) {

                const referenceSpace = renderer.xr.getReferenceSpace();
                const session = renderer.xr.getSession();

                if ( hitTestSourceRequested === false ) {

                    session.requestReferenceSpace( 'viewer' ).then( function ( referenceSpace ) {

                        session.requestHitTestSource( { space: referenceSpace } ).then( function ( source ) {

                            hitTestSource = source;

                        } );

                    } );

                    session.addEventListener( 'end', function () {

                        hitTestSourceRequested = false;
                        hitTestSource = null;

                    } );

                    hitTestSourceRequested = true;

                }

                if ( hitTestSource ) {

                    const hitTestResults = frame.getHitTestResults( hitTestSource );

                    if ( hitTestResults.length ) {

                        const hit = hitTestResults[ 0 ];

                        reticle.visible = true;
                        reticle.matrix.fromArray( hit.getPose( referenceSpace ).transform.matrix );

                    } else {

                        reticle.visible = false;

                    }

                }

            }

            renderer.render( scene, camera );

        }

  
init();
animate()


