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
// pagination
import Pagination from '@mui/material/Pagination';


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

        // TEMPORARY POLYGON LST
        dummyDataPolygons : [],

        // POLYGON INFO
        polygonName: "",
        polygonGeometry: "",

        // PANELS
        showPlacesPanel: false,
        showPointsPanel: false,
        showLinesPanel: false,
        showPolygonsPanel: false,

        // CARDS
        showPolygonCard: false,
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
            
            // TEMPORARY POLYGON LST
            case "getTempPolygonList":
                draft.dummyDataPolygons = action.tempPolygonLst
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
            case "showPlacesPanel":
                if (!action.isOpened){
                    draft.showPlacesPanel =  true
                } else {
                    draft.showPlacesPanel =  false;
                }
                
                draft.showPointsPanel = false;
                draft.showLinesPanel = false;
                draft.showPolygonsPanel = false;
                break;

            case "showPointsPanel":
                if (!action.isOpened){
                    draft.showPointsPanel =  true
                } else {
                    draft.showPointsPanel =  false;
                }
                
                draft.showPlacesPanel = false;
                draft.showLinesPanel = false;
                draft.showPolygonsPanel = false;
                break;

            case "showLinesPanel":
                if (!action.isOpened){
                    draft.showLinesPanel =  true
                } else {
                    draft.showLinesPanel =  false;
                }
                
                draft.showPlacesPanel = false;
                draft.showPointsPanel = false;
                draft.showPolygonsPanel = false;
                break;

            case "showPolygonsPanel":
                if (!action.isOpened){
                    draft.showPolygonsPanel =  true;
                } else {
                    draft.showPolygonsPanel =  false;
                }
                
                draft.showPlacesPanel = false;
                draft.showPointsPanel = false;
                draft.showLinesPanel = false;
                break;

            // CARDS
            case "showPolygonCard":
                if (!action.isOpened){
                    draft.showPolygonCard =  true;
                    console.log('Polygon card on')
                } else {
                    draft.showPolygonCard =  false;
                    console.log('Polygon card off')
                };
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

            // dispatch({type: "showPolygonsPanel", isOpened:state.showPolygonsPanel})
            dispatch({type: "showPolygonsPanel", isOpened:true})
            dispatch({type: "showPolygonCard", isOpened:state.showPolygonCard})
            dispatch({type:"getPolygonInfo", 
                polygonName: e.target.feature.properties.name,
                polygonGeom: e.target.getLatLngs(),
                // polygonGeom: e.target.toGeoJSON().geometry.coordinates[0]}
            })
            
            if (state.drawnItems){
                state.drawnItems.clearLayers();
            }
        }
        var tempPolygonList = []
        function onEachFeature(feature, layer){
            layer.on({
                click: getFeatureInfo
            })
            tempPolygonList.push(layer);
            console.log(tempPolygonList)
            dispatch({type:"getTempPolygonList", tempPolygonLst: tempPolygonList})
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
                                dispatch({type: "showPlacesPanel", isOpened:state.showPlacesPanel}),
                                dispatch({type: "showPolygonCard", isOpened:true})
                                )}
                                > PLACES
                        </Button>

                        {state.showPlacesPanel ? (
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
                                dispatch({type: "showPointsPanel", isOpened:state.showPointsPanel}),
                                dispatch({type: "showPolygonCard", isOpened:true})
                                )}
                             > POINTS
                        </Button>

                        {state.showPointsPanel ? (
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
                                dispatch({type: "showLinesPanel", isOpened:state.showLinesPanel}),
                                dispatch({type: "showPolygonCard", isOpened:true})
                                )}
                                > LINES
                        </Button>

                        {state.showLinesPanel ? (
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
                                dispatch({type: "showPolygonsPanel", isOpened:state.showPolygonsPanel}))}
                                > POLYGONS
                        </Button>

                        {state.showPolygonsPanel ? (
                            <Grid container justifyContent="center">
                            <Grid item xs={10}>
                                <TextField id="outlined-basic" label="Polygons" variant="outlined" fullWidth size="small"/>
                            </Grid>
                            <Grid item xs={2}>
                                <Button variant="contained" style={{"backgroundColor":"black"}} fullWidth > SEARCH </Button>
                                <Button variant="contained" style={{"backgroundColor":"black"}} fullWidth > ADD NEW </Button>
                            </Grid>

                       
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 450 }} aria-label="simple table">
      
                                    <TableBody>
                                    {state.dummyDataPolygons.map((polygon) => (
                                        <TableRow
                                        key={polygon._lealfet_id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                        <TableCell align="center">{polygon.feature.properties.name}</TableCell>
                                        <TableCell align="right">
                                            <Button 
                                                variant="contained" 
                                                style={{"backgroundColor":"black"}} 
                                                fullWidth
                                                onClick={()=>
                                                    dispatch({type: "showPolygonCard", isOpened:false},
                                                    dispatch({type: "showPolygonsPanel", isOpened:state.showPolygonsPanel}),
                                                    dispatch({type:"getPolygonInfo", 
                                                        polygonName: polygon.feature.properties.name,
                                                        polygonGeom: polygon.getLatLngs(),
                                                        })
                                                    )}
                                                > 
                                                    Edit 
                                            </Button>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button 
                                                variant="contained" 
                                                style={{"backgroundColor":"black"}} 
                                                fullWidth 
                                                onClick={()=>state.mapInstance.fitBounds(polygon.getBounds().pad(1))} 
                                                > 
                                                    Zoom 
                                            </Button>
                                        </TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* pagination */}
                            <Stack spacing={2}>
                                <Pagination count={Math.ceil(state.dummyDataPolygons.length/2) < 1 ? 1:Math.ceil(state.dummyDataPolygons.length/2)} variant="outlined" shape="rounded" />
                            </Stack>
    
                        </Grid>
                        ) : ""}
                    

                        {state.showPolygonCard ? (
                            <Grid container justifyContent="center">
                                <Grid item xs={12}>
                                    <Stack spacing={2} direction="rows">
                                        <Button variant="contained" style={{"backgroundColor":"green"}} fullWidth > SAVE </Button>
                                        <Button variant="contained" style={{"backgroundColor":"red"}} fullWidth > DELETE </Button>
                                        <Button 
                                            variant="contained" 
                                            style={{"backgroundColor":"grey"}} 
                                            fullWidth
                                            onClick ={()=>{
                                                console.log("canceled")
                                                dispatch({type: "showPolygonCard", isOpened:true})
                                                dispatch({type: "showPolygonsPanel", isOpened:false})
                                                }}
                                            > 
                                                CANCEL 
                                        </Button>
                                    </Stack>
                                </Grid>
                                {/* <Grid item xs={10}>
                                    <TextField id="outlined-basic" label="Polygons" variant="outlined" fullWidth size="small"/>
                                </Grid>
                                <Grid item xs={2}>
                                    <Button variant="contained" style={{"backgroundColor":"black"}} fullWidth > SEARCH </Button>
                                </Grid> */}
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
