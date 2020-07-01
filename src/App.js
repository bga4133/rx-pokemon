import React, { useState, useEffect } from "react";
import "./App.css";
import { from, BehaviorSubject } from "rxjs";
import {
  filter,
  mergeMap,
  debounceTime,
  distinctUntilChanged
} from "rxjs/operators";

const getPokemonByName = async name => {
  const { results: allPokemons } = await fetch(
    "https://pokeapi.co/api/v2/pokemon/?limit=1000"
  ).then(res => res.json());
  return allPokemons.filter(pokemon => pokemon.name.includes(name));
};

let searchSubject$ = new BehaviorSubject("");
let searchResultObservable$ = searchSubject$.pipe(
  filter(val => val.length > 1),
  debounceTime(750),
  distinctUntilChanged(),
  mergeMap(val => from(getPokemonByName(val)))
);

const useObservable$ = (observable, setter) => {
  useEffect(() => {
    let subscription = observable.subscribe(result => {
      setter(result);
    });
    return () => subscription.unsubscribe();
  }, [observable, setter]);
};

function App() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  useObservable$(searchResultObservable$, setResults);

  const handleSearchChange = e => {
    const newValue = e.target.value;
    setSearch(newValue);
    searchSubject$.next(newValue);
  };

  return (
    <div className="App">
      <h1>Pokemon app</h1>
      <input
        type="text"
        placeholder="Search"
        value={search}
        onChange={handleSearchChange}
      />
      <div>
        {results.map(pokemon => (
          <div key={pokemon.name}>{pokemon.name}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
