import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-reponse.interface';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

interface CreatePokemonDto {
  name: string;
  no: number;
}

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({}); // Is like delete query without where condition
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    const pokemonToInsert: CreatePokemonDto[] = [];

    for (const pokemon of data.results) {
      const segments: string[] = pokemon.url.split('/');

      const rawNo: string | undefined = segments.at(-2);

      if (!rawNo) {
        continue;
      }

      const parsedNo: number = Number.parseInt(rawNo);

      pokemonToInsert.push({ name: pokemon.name.toLowerCase(), no: parsedNo });
    }

    await this.pokemonModel.insertMany(pokemonToInsert);
    return 'Seed executed';
  }
}
