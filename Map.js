// https://www.youtube.com/watch?v=KLrcnwBQgCc
// https://github.com/FuzedxPheonix/Leaftlet-Draw-Get-Started-Templated

import React, { useEffect } from 'react';
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

    let markerDrawer
    let polylineDrawer
    let polygonDrawer
    let polygonEditor

    // IMMER REDUCER
    const initialState = {
        mapInstance: null,
        polygonDrawer:null,

        // polygon geometry
        // polygonGeom: "",

        // switching menu
        showPlacesMenu: false,
        showPointsMenu: false,
        showLinesMenu: false,
        showPolygonsMenu: false,

        // displaying polygon info
        polygonName: "",
        polygonGeometry: "",
 
    };

    function reducerFunction(draft, action){
        switch(action.type){
            case "getMap":
                draft.mapInstance = action.mapData;
                break;

            case "getPolygonDrawer":
                draft.mapInstance = action.polygonDraw;
                break;

            case "getPolygonInfo":
                // draft.polygonGeom = action.polygonGeometry;
                draft.polygonName = action.polygonName;
                draft.polygonGeometry = action.polygonGeom;
                break;

            // switching menu
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

    // LOADING MAP
    useEffect(() => {
        var map = L.map('mapid').setView([50.0610, 19.935], 13);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map); 

        dispatch({type:"getMap", mapData: map})
    },[]);

    // LEAFLET DRAW SETUP
    const drawnItems = new L.FeatureGroup()
    if (state.mapInstance) {
        
        ;

        markerDrawer =  new L.Draw.Marker(state.mapInstance, {icon:new L.Icon.Default()})
        polylineDrawer = new L.Draw.Polyline(state.mapInstance);
        polygonDrawer = new L.Draw.Polygon(state.mapInstance); 
        polygonEditor = new L.EditToolbar.Edit(state.mapInstance, {
            featureGroup: drawnItems,
        });

        state.mapInstance.addLayer(drawnItems);
        
        const drawControl = new L.Control.Draw({
            draw:{
                circle:false,
                rectangle:false,
                circlemarker:false
            },
            edit: {
                featureGroup: drawnItems
            }
        });
        // state.mapInstance.addControl(drawControl);
    
        state.mapInstance.on('draw:created', function(e){
            drawnItems.addLayer(e.layer);})
    };

    const addPolygon = e =>{
        polygonDrawer.enable()
    };

    const editPolygon = e =>{
        const tempLayer = L.polygon(state.polygonGeometry)
        // drawnItems.addLayer(tempLayer)
        polygonEditor.enabled() ? drawnItems.clearLayers() : drawnItems.addLayer(tempLayer)
        polygonEditor.enabled() ? polygonEditor.disable() : polygonEditor.enable()
    };

    
    // ADDING POLYGONS
    useEffect(() => {
        // function getFeatureInfo(e){
        //     state.mapInstance.fitBounds(e.target.getBounds());
        //     dispatch({
        //         type:"getPolygonInfo", 
        //         polygonGeometry: e.target.getLatLngs()})
        //         // polygonGeometry: e.target.toGeoJSON().geometry.coordinates[0]})
            
        //     console.log(e.target);
        //     console.log(e.target.getLatLngs());
        //     console.log(e.target.toGeoJSON());

        //     const drawnItems = new L.FeatureGroup();
        //     const tempLayer = L.polygon(e.target.getLatLngs())

        //     polygonEditor = new L.EditToolbar.Edit(state.mapInstance, {
        //         featureGroup: drawnItems,
        //     });
        //     state.mapInstance.addLayer(drawnItems);


        //     drawnItems.addLayer(tempLayer)
        //     polygonEditor.enable()
        // };

        function getFeatureInfo(e){
            dispatch({type: "showPolygonsMenu", isTrue:state.showPolygonsMenu})
            console.log("ttt", e.target)
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


    function changePolygonGeometry(e){

        const drawnItems = new L.FeatureGroup();
        const tempLayer = L.polygon(state.polygonGeometry)

        polygonEditor = new L.EditToolbar.Edit(state.mapInstance, {
            featureGroup: drawnItems,
        });
        state.mapInstance.addLayer(drawnItems);


        drawnItems.addLayer(tempLayer)
        polygonEditor.enable()

        state.mapInstance.on('draw:edited', function(e){
            console.log("edited", e)
        })
    };

    
    

    
    

    

    return (
        <>
            <Grid container>         

                {/* <Grid item xs={4} style={{marginTop:"0.5rem"}}>

                    <Typography variant="h4">GEOMETRIE:</Typography>

                    <Stack spacing={2} direction="column">
                    <Button 
                        variant="contained"
                        onClick={addPolygon}>
                        Add polygon</Button>
                    <Button 
                        variant="contained"
                        onClick={editPolygon}>
                        Edit polygon</Button>

                    <Grid item xs={5} style={{marginTop:"1rem"}}>
                        <TextField 
                            variant="standard"
                            fullWidth
                            multiline
                            value = {state.polygonGeom}
                            >

                        </TextField>
                    </Grid>



                    <Button 
                        variant="contained" 
                        color="error">
                        Delete polygon</Button>
                    <Button 
                        variant="contained" 
                        color="error"
                        onClick={Map.clearfeatureGroup}>
                        Clear FeatureGroup</Button>
                    </Stack>
                </Grid> */}
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
                                <Button 
                                    variant="contained" 
                                    style={{"backgroundColor":"black"}}
                                    onClick={editPolygon}
                                        > EDIT GEOMETRY
                                </Button>
                                <Button 
                                    variant="contained" 
                                    style={{"backgroundColor":"black"}}
                                    // onClick={savePolygonGeometry}
                                        > SAVE CHANGES
                                </Button>
                            </Grid>
                        ) : ""}

                        
                    </Stack>
                </Grid>

                <Grid item xs={8} style={{marginTop:"0.5rem"}}>

                    {/* <Typography variant="h4">MAPA:</Typography> */}
                    <div style={{height:"100vh"}}>
                        <div id="mapid"></div>
                    </div>
                </Grid>

            </Grid>
        </>
      );
    }

export default Map
