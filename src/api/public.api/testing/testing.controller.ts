import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.dataSource.query(
      `
      DELETE FROM public."Devices";
      DELETE FROM public."RecoveryCodes";
      DELETE FROM public."Tokens";
      DELETE FROM public."Users";
      DELETE FROM public."Blogs";
      DELETE FROM public."Posts";
      DELETE FROM public."Likes";
      DELETE FROM public."Comments";
      `,
    );
    return true;
  }
}
