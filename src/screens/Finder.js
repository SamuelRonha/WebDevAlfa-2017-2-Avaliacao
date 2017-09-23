import React, { Component } from 'react';
import {
    FlatList,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Geolocation,
    ActivityIndicator,
    ScrollView,
    Image, Modal, Button, Dimensions
} from 'react-native';


import axios from 'axios';

class Finder extends Component {

    state = {
        query: "",
        link: "",
        location: "",
        key: "[[YOUR_API_KEY]]",
        aguarde: false,
        posts: [],
        place: {},
        errors: '',
        exibirModal: false
    }

    componentDidMount() {
        const config = { enableHighAccuracy: false };
        navigator.geolocation.getCurrentPosition(this.locationSuccess, this.locationError, config);
    }

    locationSuccess = (position) => {
        this.setState({
            location: position.coords.latitude + "," + position.coords.longitude
        })
    }

    // Callback disparado se ocorrer algum erro ao obter a localização.
    locationError = (error) => {
        console.warn(error);
    }

    onItemPress = (item) => {
        this.getDetail(item);
        this.setState({ exibirModal: true })
    }



    renderItem = (record) => {
        var { item, index } = record;
        const { height, width } = Dimensions.get('window');
        return (

            <TouchableOpacity
                onPress={() => this.onItemPress(item)}>

                <View style={{
                    backgroundColor: '#fff',
                    marginHorizontal: 5, marginVertical: 10,
                    padding: 2, borderRadius: 5,
                    elevation: 2, shadowOffset: {
                        width: 2,
                        height: 2,
                    }, shadowColor: '#333', flex: 1
                }}>
                    <View style={{ width: width, flex: 1, flexDirection: 'row', padding: 2 }}>
                        {/* <Image style={{ height: 100, width: 100 }} source={{ uri: this.loadImg(item) }} /> */}
                        <Image style={{ height: 100, width: 100 }} source={{ uri: this.loadImg(item) }} />
                        <View style={{ paddingLeft: 10, width: width / 2.1 }}>
                            <Text style={{ fontWeight: 'bold', paddingBottom: 10 }}>{item.name}</Text>
                            <Text style={{ fontSize: 10, color: '#a9a9a9' }}>
                                {item.formatted_address}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity >
        )
    }



    loadImg = (item) => {
        if (item != null && item.photos != null) {
            return "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + item.photos[0].photo_reference + "&key=" + this.state.key
        } else return "http://static1.1.sqspcdn.com/static/f/1154581/21791306/1359568048283/Poppy404d.png";
    }

    loadMap = (item) => {
        if (item != null && item.geometry != null && item.geometry.location != null) {
            let path = "path=color:0x0000ff|weight:5|" + this.state.location + "|" + item.geometry.location.lat + "," + item.geometry.location.lng
            return "https://maps.googleapis.com/maps/api/staticmap?markers=" + item.geometry.location.lat + "," + item.geometry.location.lng + "&" + path + "&size=600x300&key=" + this.state.key
        } else return "http://static1.1.sqspcdn.com/static/f/1154581/21791306/1359568048283/Poppy404d.png";
    }


    onChangeText = (text) => {
        this.setState({ query: text, posts: [] });
    }



    getMap = () => {

    }


    getDetail = (item) => {
        var link = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + item.place_id + "&key=" + this.state.key
        var place = {};
        var erro = "";
        axios.get(link)
            .then((response) => {
                if (response.status === 200) {
                    console.log(response.data.result);
                    place = response.data.result
                } else {
                    erro = "Tente novamente mais tarde";
                }
            }).catch((exception) => {
                console.warn(exception);
                erro = 'Verifique sua conexão com a Internet.';
            }).finally(() => {
                this.setState(
                    (state =>
                        ({
                            aguarde: false,
                            place: place,
                            errors: erro
                        }))
                )
            })
    }

    onSubmit = () => {
        var link = ""
        var posts = []
        this.setState({ aguarde: true });
        const config = { enableHighAccuracy: false };
        navigator.geolocation.getCurrentPosition(this.locationSuccess, this.locationError, config);

        link = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + this.state.query + "&location=" + this.state.location + "+&key=" + this.state.key + ""

        let erro;
        axios.get(link)
            .then((response) => {
                if (response.status === 200) {
                    posts = response.data.results
                    console.log(response.data)
                } else {
                    console.log("Tente novamente mais tarde")
                    erro = "Tente novamente mais tarde";
                }
            }).catch((exception) => {
                console.warn(exception);
                erro = 'Verifique sua conexão com a Internet.';
            }).finally(() => {
                this.setState(
                    (state =>
                        ({
                            aguarde: false,
                            posts: [...state.posts, ...posts],
                            errors: erro
                        }))
                )
            })


    }







    onBuscarPress = () => {




    }


    render() {
        const { location } = this.state;
        const { height, width } = Dimensions.get('window');

        if (location != null && !this.state.aguarde) {
            return (
                <View style={{ flex: 1, flexDirection: 'column', width: width }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ textAlign: 'center' }}>Informe o local que deseja buscar.</Text>
                        <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                            <TextInput value={this.state.query}
                                onChangeText={this.onChangeText}
                                returnKeyType="search"
                                onSubmitEditing={this.onSubmit}
                                placeholder="Digite o deseja buscar?"
                                style={{ height: height / 15, width: width / 2 }}
                            />
                            <Button
                                //style={{ height: 10, width: width / 3 }}
                                title="Buscar"
                                onPress={() => this.onSubmit}
                            />
                        </View>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', padding: 2 }}>
                        < FlatList
                            data={this.state.posts}
                            renderItem={this.renderItem}
                            keyExtractor={(item) => item.id}
                            extraData={this.state}
                        />
                    </View>

                    <Modal
                        visible={this.state.exibirModal}
                        transparent={true}
                        onRequestClose={() => this.setState({ exibirModal: false })}
                    >
                        <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                            <Button title="Fechar" style={{ color: "transparent", position: "absolute", backgroundColor: 'rgba(52, 52, 52, 0.8)' }}
                                onPress={() => this.setState({ exibirModal: false })} />
                            <Image style={{ height: 250, width: width }} source={{ uri: this.loadImg(this.state.place) }} />

                            <Text style={{ fontWeight: 'bold', paddingBottom: 14 }}>{this.state.place.name}</Text>
                            <Text style={{ fontSize: 12, color: '#a9a9a9' }}>{this.state.place.formatted_address}</Text>
                            <Text style={{ fontSize: 12 }}>{this.state.place.formatted_phone_number}</Text>
                            <Image style={{ height: 300, width: width }} source={{ uri: this.loadMap(this.state.place) }} />
                        </View>
                    </Modal>
                </View>
            )
        }
        return (
            <View>
                <ActivityIndicator size="large" color="#f00" />
            </View>
        )


    }
}



export default Finder;