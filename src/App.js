import React from 'react'
import './App.css';
import mapbox from 'mapbox-gl'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      map: null,
      latitude: -22.9639156,
      longitude: -43.19151590,
      style: 'mapbox://styles/mapbox/dark-v10',
      places: []
    }
  }

  render () {
    return (
      <div className="App">
        <Search  app = {this}/>
        <Places app = {this}/>
        <Map app = {this}/>
        <Toggler app = {this} />
      </div>
    );
  }
}




class Search extends React.Component {
  constructor (props) {
    super (props) 
    this.state = {
      value: "",
      isLoading: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

  }


  handleChange(event) {
    this.setState ({
      value: event.target.value
    })
  }


  handleSubmit(event) {
    event.preventDefault()

    const accessToken = 'pk.eyJ1IjoiZ2FicmllbGd1ZXJyYSIsImEiOiJja2hraHR2YngweXJuMnpwaGs5ZzZhaG5kIn0.0cEDBWkyRQI2-Rl0zadrYw'
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${this.state.value}.json?access_token=${accessToken}`

    //Acessamos a API de Mapbox
    fetch(url)
      .then(response => response.json())
      .then(data => {

      //Pegamos o state de places em app
    const places = this.props.app.state.places

    //Pegamos a data do primeiro resultado da API do Mapbox
    const firstResult = data.features[0]

    //Adicionamos o value que esta no input em places, e adicionamos 
    places.push({
      name: this.state.value,
      latitude: firstResult.center[1],
      longitude: firstResult.center[0]
    })

    //Mudamos o state pra o valor de places
    this.props.app.setState ({
      places: places
    })

    this.setState ({
      value: ""
    })

      })



  }



  render () {
    return (
      <form onSubmit={this.handleSubmit}> 
        <input value={this.state.value} onChange={this.handleChange} placeholder="Add place" />
      </form>
      
    )
  }
}


class PlaceItem extends React.Component {

 
  goTo() {

    
    const map = this.props.app.state.map

    map.flyTo(
      {
        center: [this.props.placeprop.longitude, this.props.placeprop.latitude],
        zoom: 10
      }
      
      )

  }


  render() {

    //Pegamos o state inicial de map e declaramos em uma variavel
    const map = this.props.app.state.map

    //Conferimos se existe map
    if (map) {

      //Criamos um popup da API de mapbox
      const popup = new mapbox.Popup({
        closeButton: true
      })

      //Setamos o HTML do popup (setHTML é uma função de mapbox)
      popup.setHTML(this.props.placeprop.name)

      //Criamos um marker da API de Mapbox
      const marker = new mapbox.Marker({
        color: '#2727e6'
      })

      //Setamos o marker de acordo Longitude e Latitude (setLngLat é uma função de mapbox))
      marker.setLngLat([this.props.placeprop.longitude, this.props.placeprop.latitude])

      //Setamos o marker de acordo com popup (setPopup é uma função de mapbox)
      marker.setPopup(popup)

      //Setamos o marker no mapa  (addTo é uma função de mapbox)
      marker.addTo(map)
    }

    return (
      //Aqui passamos o object do state places
      <div className="place-item" onClick={() => this.goTo()}>
        {this.props.placeprop.name}<br/>
        ({this.props.placeprop.latitude}, 
        {this.props.placeprop.longitude})
      </div>
    )
  }
}


class Places extends React.Component {
  render() {
    //Nos utilizamos do state places no nosso componente App
    const places = this.props.app.state.places

    //Nos mapeamos o que esta no state places no componente placeitem (passando o object de places como props em PlaceItem)
    const placeItems = places.map(place => {
      return <PlaceItem placeprop={place} app={this.props.app}/>
    })

    //Retornamos 
    return (
      <div className="places">
       {placeItems}
      </div>
    )
  }
}






class Map extends React.Component {

  componentDidMount() {

    //Variavel para que possamos passar o state de app para o nosso componente Map
    const app = this.props.app

    mapbox.accessToken = 'pk.eyJ1IjoiZ2FicmllbGd1ZXJyYSIsImEiOiJja2hraHR2YngweXJuMnpwaGs5ZzZhaG5kIn0.0cEDBWkyRQI2-Rl0zadrYw';

    
    const map = new mapbox.Map({
      container: 'map',
      style: app.state.style,
      center: [app.state.longitude, app.state.latitude],
      zoom: 12
      });

      // Se eu quiser que não tenha um controle basta colocar entre parenteses {showCompass: false, etc} 
     const navControl = new mapbox.NavigationControl(); 

     map.addControl(navControl)

     this.props.app.setState({
       map: map
     })

  }


  render () {

    const map = this.props.app.state.map 

    if (map) {
      map.setStyle(this.props.app.state.style)
    }
    
  return (
    <div id="map">
      
    </div>
  );
  }
}


 class Toggler extends React.Component {

  setLayer(url) {
    this.props.app.setState({
      style: url
    }
    )
  }


   render() {

    const styles = [
      {name: "Satellite", url: "mapbox://styles/mapbox/satellite-v9"},
      {name: "Light", url: "mapbox://styles/mapbox/light-v10"},
      {name: "Dark", url: "mapbox://styles/mapbox/dark-v10"}
    ]


    const buttons = styles.map(style => {
      let className = ""

      if(style.url === this.props.app.state.style) {
        className = "selected"
      }


      return <button className={className} onClick={() => {this.setLayer(style.url)}}>
        {style.name}
        </button>
    })


     return (
       <div className="toggler"> {buttons} </div>
     )
   }
 }




export default App;