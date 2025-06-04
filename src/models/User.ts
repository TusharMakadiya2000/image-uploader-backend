import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import Company from "./Company";

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "SA";
  companyId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, "id">;

class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: "user" | "admin" | "SA";
  public companyId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("user", "admin", "SA"),
      allowNull: false,
      defaultValue: "user",
    },
    companyId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "companies",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "users",
  }
);

User.belongsTo(Company, { foreignKey: "companyId" });
Company.hasMany(User, { foreignKey: "companyId" });

export default User;
