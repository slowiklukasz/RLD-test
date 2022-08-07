// https://www.youtube.com/watch?v=KLrcnwBQgCc
// https://github.com/FuzedxPheonix/Leaftlet-Draw-Get-Started-Templated

import React, { useEffect, useRef } from 'react';
import { useImmerReducer } from 'use-immer';
import '../App.css';
import L from "leaflet";
import "leaflet-draw/dist/leaflet.draw.css";

// LEAFLET, REACT-LEAFLET
import { MapContainer, TileLayer, FeatureGroup, Polyline, Polygon, Popup, useMap} from 'react-leaflet'
// @MUI
import {Grid, AppBar, Stack, Button, Typography, TextField} from '@mui/material';

// TESTING POLYGONS
import PolygonsTest from './Assets/PolygonsTest.js'


const leafletDraw = require('leaflet-draw');




function Map() {
    // IMMER REDUCER
    const initialState = {
        mapInstance: null,

        // EDITING POLYGON GEOMETRY
        drawnItems: null,
        tempPolygon: "",
        tempPolygonGeometry: "",

        // POLYGON INFO
        polygonName: "",
        polygonGeometry: "",

        // MENU PANELS
        showPlacesMenu: false,
        showPointsMenu: false,
        showLinesMenu: false,
        showPolygonsMenu: false,
    };

    function reducerFunction(draft, action){
        switch(action.type){
            case "getMapInstance":
                draft.mapInstance = action.mapData;
                break;
                
            case "getDrawnItems":
                draft.drawnItems = action.drawnItemsData;
                break;

            case "getTempPolygon":
                draft.tempPolygon = action.tempPolygon;
                break;
            
            case "getTempPolygonGeometry":
                if (action.tempPolygonGeom === "resetShape"){
                    draft.tempPolygonGeometry = "";
                } else {
                    draft.tempPolygonGeometry = action.tempPolygonGeom;
                };
                break;

            case "getPolygonEditor":
                draft.polygonEditor = action.polygonEditorData;
                break;

            // POLYGON INFO
            case "getPolygonInfo":
                draft.polygonName = action.polygonName;
                draft.polygonGeometry = action.polygonGeom;
                break;




            // SWITCHING MENU PANELS
            case "showPlacesMenu":
                if (!action.isTrue){
                    draft.showPlacesMenu =  true
                } else {
                    draft.showPlacesMenu =  false;
                }
                
                draft.showPointsMenu = false;
                draft.showLinesMenu = false;
                draft.showPolygonsMenu = false;
                break;

            case "showPointsMenu":
                if (!action.isTrue){
                    draft.showPointsMenu =  true
                } else {
                    draft.showPointsMenu =  false;
                }
                
                draft.showPlacesMenu = false;
                draft.showLinesMenu = false;
                draft.showPolygonsMenu = false;
                break;

            case "showLinesMenu":
                if (!action.isTrue){
                    draft.showLinesMenu =  true
                } else {
                    draft.showLinesMenu =  false;
                }
                
                draft.showPlacesMenu = false;
                draft.showPointsMenu = false;
                draft.showPolygonsMenu = false;
                break;

            case "showPolygonsMenu":
                if (!action.isTrue){
                    draft.showPolygonsMenu =  true;
                } else {
                    draft.showPolygonsMenu =  false;
                }
                
                draft.showPlacesMenu = false;
                draft.showPointsMenu = false;
                draft.showLinesMenu = false;
                break;   
            }
        };

    const [state, dispatch] = useImmerReducer(reducerFunction, initialState)

    // MAP SECTION - https://stackoverflow.com/questions/69697017/use-leaflet-map-object-outside-useeffect-in-react
    // MAP REFS
    const mapRef = useRef(null);
    const tileRef = useRef(null);

    // LEAFLET-DRAW REFS
    const drawnItemsRef = useRef(null);
    const drawControlRef = useRef(null);
    const tempLayerRef = useRef(null);

    const markerDrawerRef = useRef(null);
    const polylineDrawerRef = useRef(null);
    const polygonDrawerRef = useRef(null);
    const polygonEditorRef = useRef(null);


    // BASE TILE FOR THE MAP
    tileRef.current = L.tileLayer(
        `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,
        {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
    );

    // MAP INSTANCE OPTIONS
    const mapParams = {
        center: [50.0610, 19.935],
        zoom: 13,
        zoomControl: false,
        zoomSnap: 0.75,
        layers: [tileRef.current], // Start with just the base layer
    };

    // MAP CREATION
    useEffect(() => {
        mapRef.current = L.map('map', mapParams);
        dispatch({type: "getMapInstance", mapData : (mapRef.current)});
      }, []);


    // DRAWN ITEMS & DRAW CONTROL
    useEffect(() => {
        if (!state.mapInstance) return;
        if (state.mapInstance) {
            drawnItemsRef.current = new L.FeatureGroup()
            drawControlRef.current = new L.Control.Draw({
                draw:{
                    circle:false,
                    rectangle:false,
                },
                edit:{
                    featureGroup:drawnItemsRef.current
                }
            });
            polygonEditorRef.current = new L.EditToolbar.Edit(state.mapInstance, {
                featureGroup: drawnItemsRef.current,
            });

            // make 1 dispatch from these 3
            dispatch({type: "getDrawnItems", drawnItemsData : (drawnItemsRef.current)},);
            dispatch({type: "getPolygonEditor", polygonEditorData : (polygonEditorRef.current)},);
            dispatch({type: "getDrawControl", drawControlData : (drawControlRef.current)});

            // TESTING EVENTS
            // drawnItemsRef.current.addTo(state.mapInstance);
            // drawControlRef.current.addTo(state.mapInstance);

            // state.mapInstance.on('draw:created', function(e){
            //     drawnItemsRef.current.addLayer(e.layer);
            //     console.log('Created', e);
            // });

            // state.mapInstance.on('draw:editstart', function(e){
            //     console.log('Start editing', e.target._layers);
            // });

            // state.mapInstance.on('draw:edited ', function(e){
            //     // console.log('Edited', e.target);
            //     console.log('Edited', Object.values(e.target._layers).pop());
            // });
        }
    }, [state.mapInstance]);

    
    // ADDING POLYGONS
    useEffect(() => {
        function getFeatureInfo(e){
            dispatch({type: "showPolygonsMenu", isTrue:state.showPolygonsMenu})
            dispatch({type:"getPolygonInfo", 
                polygonName: e.target.feature.properties.name,
                polygonGeom: e.target.getLatLngs(),
                // polygonGeom: e.target.toGeoJSON().geometry.coordinates[0]}
            })
        }
    
        function onEachFeature(feature, layer){
            layer.on({
                click: getFeatureInfo
            })
        };

        if (state.mapInstance){
            L.geoJSON(PolygonsTest, {
                onEachFeature: onEachFeature
            }).addTo(state.mapInstance)
        }
    },[state.mapInstance]);



    // EDITING POLYGON GEOMETRY
    const editPolygon = e => {
        state.drawnItems.clearLayers();

        tempLayerRef.current = null;

        if (state.tempPolygonGeometry){
            tempLayerRef.current = new L.polygon(state.tempPolygonGeometry, {color:"red", fillColor:"red"})
        } else {
            tempLayerRef.current = new L.polygon(state.polygonGeometry, {color:"red", fillColor:"red"})
            dispatch({type:"getTempPolygon", tempPolygon:tempLayerRef.current})
        };

        state.drawnItems.addLayer(tempLayerRef.current)
        state.mapInstance.addLayer(state.drawnItems);

        state.polygonEditor.enable();
    };

  
    const savePolygonChange = e => {
        console.log("Changes saved")

        state.polygonEditor.save()
        let newShape = state.tempPolygon.getLatLngs()
        // let newShape = state.tempPolygon.toGeoJSON().geometry.coordinates

        console.log(state.tempPolygon.getLatLngs())
        console.log(state.tempPolygon.toGeoJSON())

        dispatch({type:"getTempPolygonGeometry", tempPolygonGeom : newShape})

        state.polygonEditor.disable()

        // let tempLyrId = state.drawnItems.getLayerId(state.tempPolygon)
        // console.log(tempLyrId)
        // let modifiedLyr = state.drawnItems.getLayer(tempLyrId)
        // let newShape = modifiedLyr.toGeoJSON().features[0].geometry
        // let newShape = modifiedLyr.getLatLngs()
    };

    const cancelPolygonChange = e => {
        state.drawnItems.clearLayers();
        state.mapInstance.removeLayer(state.drawnItems);
        state.polygonEditor.disable();
        dispatch({type:"getTempPolygonGeometry",tempPolygonGeom : "resetShape"})
    };


    return (
        <>
            <Grid container>         
                <Grid item xs={4} style={{marginTop:"0.5rem", padding:"1rem"}}>
                    <Stack spacing={2} direction="column">

                        {/* PLACES */}
                        <Button 
                            variant="contained" 
                            style={{"backgroundColor":"black"}}
                            size="large"
                            onClick= {(e)=>dispatch({type: "showPlacesMenu", isTrue:state.showPlacesMenu})}
                                > PLACES
                        </Button>

                        {state.showPlacesMenu ? (
                            <Grid container justifyContent="center">
                                <Grid item xs={10}>
                                    <TextField id="outlined-basic" label="Places" variant="outlined" fullWidth size="small"/>
                                </Grid>
                                <Grid item xs={2}>
                                    <Button variant="contained" style={{"backgroundColor":"black"}} fullWidth > SEARCH</Button>
                                </Grid>
                            </Grid>):""}
                        

                        {/* POINTS */}
                        <Button 
                            variant="contained" 
                            style={{"backgroundColor":"black"}}
                            size="large"
                            onClick= {(e)=>dispatch({type: "showPointsMenu", isTrue:state.showPointsMenu})}
                             > POINTS
                        </Button>

                        {state.showPointsMenu ? (
                            <Grid container justifyContent="center">
                                <Grid item xs={10}>
                                    <TextField id="outlined-basic" label="Points" variant="outlined" fullWidth size="small"/>
                                </Grid>
                                <Grid item xs={2}>
                                    <Button variant="contained" style={{"backgroundColor":"black"}} fullWidth > SEARCH</Button>
                                </Grid>
                            </Grid>):""}

                        
                        {/* LINES */}
                        <Button 
                            variant="contained" 
                            style={{"backgroundColor":"black"}}
                            size="large"
                            onClick= {(e)=>dispatch({type: "showLinesMenu", isTrue:state.showLinesMenu})}
                                > LINES
                        </Button>

                        {state.showLinesMenu ? (
                            <Grid container justifyContent="center">
                                <Grid item xs={10}>
                                    <TextField id="outlined-basic" label="Lines" variant="outlined" fullWidth size="small"/>
                                </Grid>
                                <Grid item xs={2}>
                                    <Button variant="contained" style={{"backgroundColor":"black"}} fullWidth > SEARCH</Button>
                                </Grid>
                            </Grid>
                        ) :""}

                        
                        {/* POLYGONS */}
                        <Button 
                            variant="contained" 
                            style={{"backgroundColor":"black"}}
                            size="large"
                            onClick= {(e)=>dispatch({type: "showPolygonsMenu", isTrue:state.showPolygonsMenu})}
                                > POLYGONS
                        </Button>

                        {state.showPolygonsMenu ? (
                            <Grid container justifyContent="center">
                                <Grid item xs={10}>
                                    <TextField id="outlined-basic" label="Polygons" variant="outlined" fullWidth size="small"/>
                                </Grid>
                                <Grid item xs={2}>
                                    <Button variant="contained" style={{"backgroundColor":"black"}} fullWidth > SEARCH</Button>
                                </Grid>
                                <TextField id="outlined-basic" label ="Name" value={state.polygonName} variant="outlined" fullWidth size="small"/>
                                <TextField id="outlined-basic" label="Geometry" value={state.polygonGeometry} variant="outlined" fullWidth size="small" multiline/>
                                <TextField id="outlined-basic" label="Temp Geometry" value={state.tempPolygonGeometry} variant="outlined" fullWidth size="small" multiline/>
                                <Button 
                                    variant="contained" 
                                    style={{"backgroundColor":"black"}}
                                    onClick={editPolygon}
                                        > EDIT GEOMETRY
                                </Button>
                                <Button 
                                    variant="contained" 
                                    style={{"backgroundColor":"black"}}
                                    onClick={savePolygonChange}
                                        > SAVE CHANGES
                                </Button>
                                <Button 
                                    variant="contained" 
                                    style={{"backgroundColor":"black"}}
                                    onClick={cancelPolygonChange}
                                        > CANCEL CHANGES
                                </Button>
                            </Grid>
                        ) : ""}

                        
                    </Stack>
                </Grid>

                <Grid item xs={8} style={{marginTop:"0.5rem"}}>

                    {/* <Typography variant="h4">MAPA:</Typography> */}
                    <div style={{height:"100vh"}}>
                        <div id="map"></div>
                    </div>
                </Grid>

            </Grid>
        </>
      );
    }

export default Map
