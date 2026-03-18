import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-reponse.interface';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  async executeSeed() {
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');

    for (const pokemon of data.results) {
      const segments: string[] = pokemon.url.split('/');

      const rawNo: string | undefined = segments.at(-2);

      if (!rawNo) {
        continue;
      }

      const parsedNo: number = Number.parseInt(rawNo);

      console.log({ name: pokemon.name, no: parsedNo });
    }

    return data.results;
  }
}
