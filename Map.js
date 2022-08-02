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
import {Grid, AppBar, Stack, Button, Typography} from '@mui/material';

const leafletDraw = require('leaflet-draw');



function Map() {

    let markerDrawer
    let polylineDrawer
    let polygonDrawer
    let polygonEditor

    // IMMER REDUCER
    const initialState = {
        mapInstance: null,
        polygonDrawer:null
        };

    function reducerFunction(draft, action){
        switch(action.type){
            case "getMap":
                draft.mapInstance = action.mapData;
                break;

            case "getPolygonDrawer":
                draft.mapInstance = action.polygonDraw;
                break;
            }
        };

    const [state, dispatch] = useImmerReducer(reducerFunction, initialState)


    useEffect(() => {
        var map = L.map('mapid').setView([50.0610, 19.935], 13);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map); 

        dispatch({type:"getMap", mapData: map})
    },[]);

    if (state.mapInstance) {
        
        const drawnItems = new L.FeatureGroup();

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
        state.mapInstance.addControl(drawControl);
    
        state.mapInstance.on('draw:created', function(e){
            drawnItems.addLayer(e.layer);})
    };

    const addPolygon = e =>{
        polygonDrawer.enable()
    };

    const editPolygon = e =>{
        polygonEditor.enabled() ? polygonEditor.disable() : polygonEditor.enable()
    };

    

    return (
        <>
            <Grid container>
            

                <Grid item xs={4} style={{marginTop:"0.5rem"}}>

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
                </Grid>

                <Grid item xs={8} style={{marginTop:"0.5rem"}}>

                    <Typography variant="h4">MAPA:</Typography>
                    <div style={{height:"100vh"}}>
                        <div id="mapid"></div>
                    </div>
                </Grid>

            </Grid>
        </>
      );
    }

export default Map
