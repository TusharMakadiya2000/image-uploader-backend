import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface CompanyAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CompanyCreationAttributes = Optional<CompanyAttributes, "id">;

class Company extends Model<CompanyAttributes, CompanyCreationAttributes>
  implements CompanyAttributes {
  public id!: number;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "companies",
  }
);

export default Company;
