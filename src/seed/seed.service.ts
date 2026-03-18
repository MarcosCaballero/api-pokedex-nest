import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-reponse.interface';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

interface CreatePokemonDto {
  name: string;
  no: number;
}

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({}); // Is like delete query without where condition
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

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
