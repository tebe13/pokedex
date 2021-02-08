import React, { Component } from "react";
import PokemonCard from "./PokemonCard";
import InfiniteScroll from "react-infinite-scroll-component";
import styled from "styled-components";
import { Link } from "react-router-dom";

import axios from "axios";

const Sprite = styled.img`
  width: 5em;
  height: 5em;
  display: none;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: black;
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`;

export default class PokemonList extends Component {
  state = {
    url: "https://pokeapi.co/api/v2/pokemon/",
    pokemonRes: [],
    items: Array.from({ length: 20 }),
    pokemon: null,
    currentUrl: "",
    imageLoading: true,
    toManyRequests: false,
    image: "",
    pokemonFiltered: [],
    name: "",
    show: true,
  };

  async componentDidMount() {
    const res = await axios.get(this.state.url);
    this.setState({ pokemonRes: res.data["results"], pokemon: res.data });
  }

  fetchMoreData = async () => {
    let currentUrl = this.state.url;
    const tempUrl = currentUrl;
    const nextRes = await axios.get(this.state.pokemon.next);

    if (tempUrl !== nextRes.data.next) {
      currentUrl = nextRes.data.next;
      this.state.pokemon.next = nextRes.data.next;
    }

    this.setState({ pokemonNextRes: nextRes.data["results"] });

    setTimeout(() => {
      this.state.pokemonRes.push.apply(
        this.state.pokemonRes,
        this.state.pokemonNextRes
      );
      this.setState({});
    }, 1500);
  };

  onFilterTypes = (pokepoke) => {
    this.setState({ show: false });
    const promises = [];
    for (let i = 1; i <= this.state.pokemonRes.length; i++) {
      const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
      promises.push(fetch(url).then((res) => res.json()));
    }
    Promise.all(promises).then((results) => {
      const pokemon = results
        .map((result) => ({
          name: result.name,
          image: result.sprites["front_default"],
          type: result.types.map((types) => types.type.name).join(", "),
          id: result.id,
        }))
        .sort((a, b) => (a.type > b.type ? 1 : -1));
      const filteredPokemonsByType = pokemon.filter((x) =>
        x.type.includes(pokepoke)
      );
      setTimeout(() => {
        this.setState({ pokemonFiltered: filteredPokemonsByType });
        this.setState({ show: false });
      }, 100);
    });
  };

  onClearFilter = () => {
    setTimeout(() => {
      this.setState({ show: true });
      this.setState({ pokemonFiltered: [] });
    }, 1000);
  };

  render() {
    return (
      <div>
        <div>
          <h3>Filter your pokemon</h3>
          <div className="row container" style={{}}>
            <button
              type="button"
              className="btn btn-danger col-md-3 col-sm-6 mb-5"
              style={{ marginRight: 20 }}
              onClick={() => this.onFilterTypes("fire")}
            >
              Fire type Pokémon
            </button>
            <button
              type="button"
              className="btn btn-success col-md-3 col-sm-6 mb-5"
              style={{ marginRight: 20 }}
              onClick={() => this.onFilterTypes("grass")}
            >
              Grass type Pokémon
            </button>
            <button
              type="button"
              className="btn btn-secondary col-md-3 col-sm-6 mb-5"
              style={{ marginRight: 20 }}
              onClick={() => this.onClearFilter()}
            >
              Clear Filtered Pokemon
            </button>
          </div>
        </div>
        <div className="">
          <div className="row">
            {this.state.pokemonFiltered.map((poke, index) => (
              <div className="col-md-4 col-sm-6 mb-5" key={index}>
                <StyledLink to={`pokemon/${poke.id}`}>
                  <div className="card">
                    <h6 className="card-header">{poke.type}</h6>
                    <Sprite
                      className="card-img-top rounded mx-auto mt-2"
                      src={poke.image}
                      onLoad={() => this.setState({ imageLoading: false })}
                      onError={() => this.setState({ toManyRequests: true })}
                      style={
                        this.state.toManyRequests
                          ? { display: "none" }
                          : this.state.imageLoading
                          ? null
                          : { display: "block" }
                      }
                    />
                    <div className="card-body mx-auto">
                      <h6 className="card-title">
                        {poke.name
                          .toLowerCase()
                          .split(" ")
                          .map(
                            (s) => s.charAt(0).toUpperCase() + s.substring(1)
                          )
                          .join(" ")}
                      </h6>
                    </div>
                  </div>
                </StyledLink>
              </div>
            ))}
          </div>
        </div>

        {this.state.show ? (
          <div id="scrollableDiv">
            <InfiniteScroll
              dataLength={this.state.pokemonRes.length}
              next={this.fetchMoreData}
              hasMore={true}
              loader={<h4>Loading...</h4>}
            >
              <div className="row">
                {this.state.pokemonRes.map((pokemonRes, index) => (
                  <PokemonCard
                    key={index}
                    name={pokemonRes.name}
                    url={pokemonRes.url}
                  />
                ))}
              </div>
            </InfiniteScroll>
          </div>
        ) : null}
      </div>
    );
  }
}
