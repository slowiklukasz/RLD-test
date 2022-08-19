// https://www.youtube.com/watch?v=KLrcnwBQgCc
// https://github.com/FuzedxPheonix/Leaftlet-Draw-Get-Started-Templated

import React, { useState, useEffect, useRef } from 'react';
import { useImmerReducer } from 'use-immer';
import '../App.css';
import L from "leaflet";
import "leaflet-draw/dist/leaflet.draw.css";

// LEAFLET, REACT-LEAFLET
import { MapContainer, TileLayer, FeatureGroup, Polyline, Polygon, Popup, useMap} from 'react-leaflet'
// @MUI
import {Grid, AppBar, Stack, Button, Typography, TextField,
Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper}from '@mui/material';

// TESTING POLYGONS
import PolygonsTest from './Assets/PolygonsTest.js'

const leafletDraw = require('leaflet-draw');


function Map() {

    // IMMER REDUCER
    const initialState = {
        mapInstance: null,

        // EDITING MODE
        isEdited: false,

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

            // EDITING MODE
            case "turnOnEditing":
                draft.isEdited = true;
                break;

            case "turnOffEditing":
                draft.isEdited = false;
                draft.polygonEditor.disable();
                break;
            
            // POLYGON INFO
            case "getPolygonInfo":
                draft.polygonName = action.polygonName;
                draft.polygonGeometry = action.polygonGeom;
                break;
            
            // EDITING POLYGON GEOMETRY
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

            case "getPolygonDrawer":
                draft.polygonDrawer = action.polygonDrawerData;
                break;

            case "getPolygonEditor":
                draft.polygonEditor = action.polygonEditorData;
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

            case "switchMapFeature":               
                draft.drawnItems.clearLayers();
                draft.polygonDrawer.disable();
                draft.polygonEditor.disable();
            };
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
    const tempNewShapeRef = useRef(null);

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

            polygonDrawerRef.current = new L.Draw.Polygon(state.mapInstance)

            // make 1 dispatch from these 3
            dispatch({type: "getDrawnItems", drawnItemsData : (drawnItemsRef.current)},);
            dispatch({type: "getPolygonEditor", polygonEditorData : (polygonEditorRef.current)},);
            dispatch({type: "getPolygonDrawer", polygonDrawerData : (polygonDrawerRef.current)},);
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

            // state.mapInstance.on('draw:edited ', function(e){y
            //     // console.log('Edited', e.target);
            //     console.log('Edited', Object.values(e.target._layers).pop());
            // });
        }
    }, [state.mapInstance]);

    
    // ADDING POLYGONS
    useEffect(() => {
        function getFeatureInfo(e){
            dispatch({type:"switchMapFeature"})
            dispatch({type:"getTempPolygonGeometry",tempPolygonGeom : "resetShape"})
            dispatch({type:"turnOffEditing"})

            dispatch({type: "showPolygonsMenu", isTrue:state.showPolygonsMenu})
            dispatch({type:"getPolygonInfo", 
                polygonName: e.target.feature.properties.name,
                polygonGeom: e.target.getLatLngs(),
                // polygonGeom: e.target.toGeoJSON().geometry.coordinates[0]}
            })
            
            if (state.drawnItems){
                state.drawnItems.clearLayers();
            }
        }
    
        function onEachFeature(feature, layer){
            layer.on({
                click: getFeatureInfo
            })
        };

        if (state.mapInstance){
            let lstOfPolygons = L.geoJSON(PolygonsTest, {
                onEachFeature: onEachFeature
            }).addTo(state.mapInstance)
        }
    },[state.mapInstance]);



    // EDITING POLYGON GEOMETRY
    const editPolygon = e => {

        dispatch({type:"turnOnEditing"})

        state.drawnItems.clearLayers();
        if (state.tempPolygonGeometry){
            tempLayerRef.current = new L.polygon(state.tempPolygonGeometry, {color:"red", fillColor:"red"})
        } else {
            tempLayerRef.current = new L.polygon(state.polygonGeometry, {color:"red", fillColor:"red"})
        };

        dispatch({type:"getTempPolygon", tempPolygon:tempLayerRef.current})

        state.drawnItems.addLayer(tempLayerRef.current)
        state.mapInstance.addLayer(state.drawnItems);

        state.polygonEditor.enable();
    };

    const createPolygon = () =>{
        dispatch({type:"turnOnEditing"})

        state.polygonDrawer.setOptions({shapeOptions: {color: 'red', fillColor:'red'}})
        state.polygonDrawer.enable();
        state.drawnItems.clearLayers();

        state.mapInstance.on('draw:created', function (e) {
            tempLayerRef.current = e.layer;
            dispatch({type:"getTempPolygon", tempPolygon:tempLayerRef.current})
            state.drawnItems.clearLayers();
            state.drawnItems.addLayer(tempLayerRef.current)
            state.mapInstance.addLayer(state.drawnItems);
        });
    };

  
    const savePolygonChange = () => {
        dispatch({type:"turnOffEditing"})

        console.log("Changes saved")

        state.polygonEditor.save()
        tempNewShapeRef.current = state.tempPolygon.getLatLngs()
        // let newShape = state.tempPolygon.getLatLngs()
        // let newShape = state.tempPolygon.toGeoJSON().geometry.coordinates

        // console.log(state.tempPolygon.getLatLngs())
        // console.log(state.tempPolygon.toGeoJSON())

        // dispatch({type:"getTempPolygonGeometry", tempPolygonGeom : newShape})
        dispatch({type:"getTempPolygonGeometry", tempPolygonGeom : tempNewShapeRef.current})

        state.polygonEditor.disable()
    };

    const cancelPolygonChange = () => {
        dispatch({type:"turnOffEditing"})
        state.drawnItems.clearLayers();
        
        if (state.tempPolygonGeometry){
            tempLayerRef.current = new L.polygon(state.tempPolygonGeometry, {color:"red", fillColor:"red"})
            state.drawnItems.addLayer(tempLayerRef.current)
            state.mapInstance.addLayer(state.drawnItems);
        };

        state.polygonEditor.disable();
    };

    const resetPolygonChange = () => {
        dispatch({type:"turnOffEditing"})
        state.drawnItems.clearLayers();
        state.mapInstance.removeLayer(state.drawnItems);
        state.polygonEditor.disable();
        dispatch({type:"getTempPolygonGeometry",tempPolygonGeom : "resetShape"})
    };



    // TABLE
    function createData(name, data, geom) {
        return { name, data, geom};
    };

    const rows = [
    createData('Polygon1', 159, 6.0),
    createData('Polygon2', 237, 9.0),
    createData('Polygon3', 262, 16.0),
    ];


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
                            onClick= {(e)=> (
                                resetPolygonChange(),
                                dispatch({type: "showPlacesMenu", isTrue:state.showPlacesMenu}))}
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
                            onClick= {(e)=> (
                                resetPolygonChange(),
                                dispatch({type: "showPointsMenu", isTrue:state.showPointsMenu}))}
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
                            onClick= {(e)=> (
                                resetPolygonChange(),
                                dispatch({type: "showLinesMenu", isTrue:state.showLinesMenu}))}
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
                            onClick= {(e)=> (
                                // resetPolygonChange(),
                                dispatch({type: "showPolygonsMenu", isTrue:state.showPolygonsMenu}))}
                                > POLYGONS
                        </Button>

                        {/* HARDCODED - WILL BE REPLACED WITH MAP FUNCTION ON OBJECT FROM AXIOS REQUEST */}
                        <Grid container justifyContent="center">
                            <Grid item xs={10}>
                                <TextField id="outlined-basic" label="Polygons" variant="outlined" fullWidth size="small"/>
                            </Grid>
                            <Grid item xs={2}>
                                <Button variant="contained" style={{"backgroundColor":"black"}} fullWidth > LUPKA </Button>
                            </Grid>

                            {/*  */}
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 450 }} aria-label="simple table">
                                    <TableHead>
                                    <TableRow>
                                        <TableCell align="center">Number</TableCell>
                                        <TableCell align="center">Edit</TableCell>
                                        <TableCell align="center">Zoom</TableCell>
                                    </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    {rows.map((row) => (
                                        <TableRow
                                        key={row.name}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                        <TableCell align="center">{row.name}</TableCell>
                                        <TableCell align="right">
                                            <Button variant="contained" style={{"backgroundColor":"black"}} fullWidth > Edit </Button>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button variant="contained" style={{"backgroundColor":"black"}} fullWidth > Zoom </Button>
                                        </TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
    
                        </Grid>



                        {state.showPolygonsMenu ? (
                            <Grid container justifyContent="center">
                                <Grid item xs={10}>
                                    <TextField id="outlined-basic" label="Polygons" variant="outlined" fullWidth size="small"/>
                                </Grid>
                                <Grid item xs={2}>
                                    <Button variant="contained" style={{"backgroundColor":"black"}} fullWidth > SEARCH </Button>
                                </Grid>
                                <TextField id="outlined-basic" label ="Name" value={state.polygonName} variant="outlined" fullWidth size="small"/>
                                <TextField id="outlined-basic" label="Geometry" value={state.polygonGeometry} variant="outlined" fullWidth size="small" multiline/>
                                <TextField id="outlined-basic" label="Temp Geometry" value={state.tempPolygonGeometry} variant="outlined" fullWidth size="small" multiline/>

                                {!state.isEdited ? (
                                    <div>
                                        <Button 
                                            variant="contained" 
                                            style={{"backgroundColor":"black"}}
                                            onClick={createPolygon}
                                                > {state.polygonGeometry ? "RE-DRAW" : "DRAW"}
                                                
                                        </Button>
                                        {state.polygonGeometry ? (
                                            <Button 
                                                variant="contained" 
                                                style={{"backgroundColor":"black"}}
                                                onClick={editPolygon}
                                                    > EDIT GEOMETRY
                                            </Button>
                                        ) : ""}
                                        
                                        {state.tempPolygonGeometry ? 
                                        <Button 
                                            variant="contained" 
                                            style={{"backgroundColor":"black"}}
                                            onClick={resetPolygonChange}
                                                > RESET CHANGES
                                        </Button> : ""}
                                    </div>
                                ) : (
                                    <div>
                                        <Button 
                                            variant="contained" 
                                            style={{"backgroundColor":"black"}}
                                            onClick={savePolygonChange}
                                                > SAVE
                                        </Button>
                                        <Button 
                                            variant="contained" 
                                            style={{"backgroundColor":"black"}}
                                            onClick={cancelPolygonChange}
                                                > CANCEL
                                        </Button>
                                    </div>
                                )}
                                
                               
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
