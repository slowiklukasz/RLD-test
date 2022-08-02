import  {React, useState} from 'react'
// LEAFLET, REACT-LEAFLET
import { MapContainer, TileLayer, FeatureGroup, Polyline, Polygon, Popup, useMap} from 'react-leaflet'
import L from "leaflet"
// LEAFLET-DRAW
import { EditControl } from "react-leaflet-draw"
import "leaflet-draw/dist/leaflet.draw.css"
// @MUI
import {Grid, AppBar, Stack, Button, Typography} from '@mui/material';
import { useImmerReducer } from 'use-immer';

// TESTING POLYGONS
import PolygonsTest from './Assets/PolygonsTest.js'
import PolygonTest1 from './Assets/PolygonTest1.js'
import PolygonTest2 from './Assets/PolygonTest2.js'


function BasicMap() {

  // IMMER REDUCER
  const initialState = {
    mapInstance: null,
  };

  function reducerFunction(draft, action){
    switch(action.type){
        // useMap hook to zoom map to selected borough
        case "getMap":
            draft.mapInstance = action.mapData;
            break;
        }
    };

  const [state, dispatch] = useImmerReducer(reducerFunction, initialState)
  const [mapLayers, setMapLayers] = useState([])


  const _onCreated = e =>{
    console.log(e)

    const {layerType, layer} = e;
    if(layerType ==="polygon" ){
      const {_leaflet_id} = layer;
      setMapLayers( layers => [...layers, {id:_leaflet_id, latLngs: layer.getLatLngs()[0]} ])
    }
  };

  const _onEdited = e => {
    console.log(e)
    const { layers: {_layers}} = e 

    Object.values(_layers).map(({ _leaflet_id, editing})=>{
      setMapLayers((layers) => 
        layers.map((l) => l.id === _leaflet_id
          ? { ...l, latlngs: {...editing.latlngs[0]}}
          :l
        )
      );
    })
  };

  const _onDeleted = (e) => {
    console.log(e)
    const {layers : {_layers}} = e;

    Object.values(_layers).map(({_leaflet_id}) => {
      setMapLayers((layers) => layers.filter((l) => l.id !== _leaflet_id))
    });
  };


  const addPolygon =(e)=> {
    var e = document.createEvent('Event');
    e.initEvent('click', true, true);
    var cb = document.getElementsByClassName('leaflet-draw-draw-polygon');
    return !cb[0].dispatchEvent(e);
  };

  const editPolygon =(e)=> {
    var e = document.createEvent('Event');
    e.initEvent('click', true, true);
    var cb = document.getElementsByClassName('leaflet-draw-edit-edit');
    return !cb[0].dispatchEvent(e);
  };

  const deletePolygon =(e)=> {
    var e = document.createEvent('Event');
    e.initEvent('click', true, true);
    var cb = document.getElementsByClassName('leaflet-draw-edit-remove');
    return !cb[0].dispatchEvent(e);
  };


  function TheMapComponent(){
    const map = useMap();
    dispatch({type: "getMap", mapData: map});
    return null
  };

  const testEditStop = (e) =>{
    console.log('Edition stopped')
  };

  const testEditStart = (e) =>{
    console.log('Edition start')
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
            color="error"
            onClick={deletePolygon}>
              Delete polygon</Button>
        </Stack>

        <pre>{JSON.stringify(mapLayers, 0, 2)}</pre>
      </Grid>


      <Grid item xs={8} style={{marginTop:"0.5rem"}}>

        <Typography variant="h4">MAPA:</Typography>

        <AppBar position="sticky">
          <div style={{height:"100vh"}}>

            <MapContainer center={[50.0610, 19.935]} zoom={13} scrollWheelZoom={true}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <TheMapComponent /> 


                {/* <Polygon positions={PolygonTest1} weight="5" color="black" fillColor="green" opacity="0.5" fillOpacity="0.8" onClick={() => console.log("this works")}/> */}
                {/* <Polygon positions={PolygonTest2} weight="5" color="black" fillColor="green" opacity="0.5" fillOpacity="0.8" onClick={() => console.log("this works")}/> */}
                {PolygonsTest.map((polygon) => {
                  return (
                    <Polygon positions={polygon} weight="5" color="black" fillColor="green" opacity="0.5" fillOpacity="0.8" 
                      eventHandlers={{
                        click: () => {
                          console.log("marker clicked");
                        }
                      }}
                    >
                      {/* <Popup
                      style={{disabled : false}}>
                        <Stack spacing={2} direction="column">
                          <Typography variant="body1" align="left" >
                            GEOM: {polygon}
                          </Typography>
                          
                          <Button 
                            variant="contained"
                            onClick={addPolygon}>
                              Change geometry</Button>
                          <Button 
                            variant="contained"
                            onClick={editPolygon}>
                              Edit current geometry</Button>
                          <Button 
                            variant="contained" 
                            color="error"
                            onClick={deletePolygon}>
                              Delete polygon</Button>
                        </Stack>
                      </Popup> */}
                    </Polygon>
                  )
                })}

                <FeatureGroup>
                  <EditControl 
                    position="topright"
                    onCreated={_onCreated}
                    onEdited={_onEdited}
                    onDeleted={_onDeleted}
                    onEditStop = {testEditStop}
                    onEditStart = {testEditStart}
                    draw={{
                      rectangle:false,
                      polyline:false,
                      circle:false,
                      circlemarker:false,
                      marker:false
                    }} 
                    />
                </FeatureGroup>

            </MapContainer>
          </div>
        </AppBar>
      </Grid>

      

      </Grid>
    </>
  )
}

export default BasicMap
