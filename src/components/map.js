import 'bootstrap/dist/css/bootstrap.css';
import '../App.css'
import React from 'react';
import axios from 'axios';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Polygon} from "react-google-maps"
import { DrawingManager } from "react-google-maps/lib/components/drawing/DrawingManager";
import { Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter } from 'reactstrap';
import {toast, ToastContainer } from 'react-toastify';

const serverURL = "https://zones-backend-halan.herokuapp.com​";

export class Map extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          points:[],
          shown:false,
          zones:[],
          zonesFetched:[],
          name:"",
          background:"",
          show:false,
          label:'',
          color:'',
          remove:false,
          zoneId:'',
          zoneName:''
      }

      this.handleMap = this.handleMap.bind(this);
      this.onPolygonComplete = this.onPolygonComplete.bind(this);
      this.fetchZones = this.fetchZones.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleChangeLabel = this.handleChangeLabel.bind(this);
      this.handleChangeColor = this.handleChangeColor.bind(this);
      this.removeZone = this.removeZone.bind(this);
      this.fetchZones();
    }

    async fetchZones(){
      axios.get(serverURL + '/zones', 
      {
        headers: { Authorization: `Bearer ${window.localStorage.getItem('token')}` }
      }).then
        ((response)=> {
          console.log(response.data['message']);
          console.log(response.data['data']);
          var zones=response.data['data'];
          this.setState({zones: response.data['data']});
          var newList = [];
              for(var i = 0; i < zones.length; i++){
                var paths=[]; 
              //loop through paths of zones
                for(var j=0; j<zones[i]['points'].length; j++){
                  var point = {
                    lat: parseFloat(zones[i]['points'][j]["lat"]),
                    lng: parseFloat(zones[i]['points'][j]["lng"])
                  };           
                
                paths.push(point);
              }
              newList.push({
                id:zones[i]['_id'],
                label: zones[i]['label'],
                points: paths,
                color : zones[i]['color']});
           
            }
            this.setState({zonesFetched: newList});
        })
        .catch(function (error) {
   
        })
        .then(function () {
          // always executed
        });    
  }

   handleMap(){
        return (
        <GoogleMap 
          defaultZoom={10} 
          defaultCenter={{lat:30.044420, lng:31.235712 }}
        >
          
          {
            this.state.zonesFetched.map((zone)=>
              <Polygon 
              key={zone['id']}
              id={zone['id']}
              paths={zone['points']}
              options={
                {fillColor: zone['color'],
                clickable: true,
                editable: false
              }}
              onClick={() => {this.setState({remove: true, zoneId:zone['id']})}}    
          />
            )
          }
        {
          this.state.show? 
            <Modal isOpen centered close>
           <Form id="zoneModal" onSubmit={this.handleSubmit}>
              <FormGroup>
                  <Label htmlFor="username">Zone Name</Label>
                  <Input onChange={this.handleChangeLabel} name="label"/>
                  <Label htmlFor="color">Zone color</Label>
                  <Input type='color' onChange={this.handleChangeColor} name="color"/>
              </FormGroup>
             <Button type="submit" value="submit" color="primary">Add</Button>
            </Form>
           </Modal>   
          :null
        }

        {
          this.state.remove?
          <Modal isOpen centered close>
            <ModalBody>
              Are you sure you want to remove the zone?
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                onClick={this.removeZone}
              >
                Confirm
              </Button>
              {' '}
              <Button onClick={function noRefCheck(){}}>
                Cancel
              </Button>
            </ModalFooter>
           </Modal>
          :null
        } 
        
          <DrawingManager
              onPolygonComplete={this.onPolygonComplete}
              options={{
                drawingControl: true,
                drawingControlOptions: {
                  style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                  position: window.google.maps.ControlPosition.TOP_LEFT,
                  drawingModes: [window.google.maps.drawing.OverlayType.POLYGON]
                }
              }
            }                    
            />
        </GoogleMap>
          );
      }
    
    onPolygonComplete(polygon){
      var polygonBounds = polygon.getPath();
      //this.state.points=[];
      this.setState({points: []});
      for (var i = 0; i < polygonBounds.length; i++) {
            var point = {
              lat: polygonBounds.getAt(i).lat(),
              lng: polygonBounds.getAt(i).lng()
            };
            this.state.points.push(point);
            this.setState({points: this.state.points});
       }
      this.setState({show:true});   
    }

     handleChangeLabel(e) {
      e.preventDefault();
      this.state.label = e.target.value;
    };

    handleChangeColor(e) {
      e.preventDefault();
      this.state.color = e.target.value;
    };

    async handleSubmit(event){
      event.preventDefault();
      axios.post(serverURL+'/zones', {
        "label": this.state.label,
        "color": this.state.color,
        "points": this.state.points
      },
      {
        headers: { Authorization: `Bearer ${window.localStorage.getItem('token')}` }
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        
      })
      .then(()=> {
        // always executed
        this.fetchZones();
        this.setState({show:false});
      });  
      
    };

    async removeZone(){
      axios.delete(serverURL+'/zones/'+this.state.zoneId, 
      {
        headers: { Authorization: `Bearer ${window.localStorage.getItem('token')}` }
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        
      })
      .then(()=> {
        this.setState({remove:false});
        this.fetchZones();
      }); 
    };
 
    render() {
      const WrappedMap = withScriptjs(withGoogleMap(this.handleMap));
      return (       
        <div style={{ width: "100vw", height: "100vh" }} id="body">  
            <WrappedMap 
            googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places}`}
            loadingElement={<div style={{height:'100%'}}/>}
            containerElement={<div style={{ height: `100%` }} />}
            mapElement={<div style={{ height: `100%` }} />}
            />
        </div>   
      );
    }
  }  
  
  export default Map;