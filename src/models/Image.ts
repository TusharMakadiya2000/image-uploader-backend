import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./User";
import Company from "./Company";

interface ImageAttributes {
  id: number;
  url: string;
  userId: number;
  companyId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type ImageCreationAttributes = Optional<ImageAttributes, "id">;

class Image extends Model<ImageAttributes, ImageCreationAttributes>
  implements ImageAttributes {
  public id!: number;
  public url!: string;
  public userId!: number;
  public companyId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Image.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    url: { type: DataTypes.STRING, allowNull: false },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
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
    tableName: "images",
  }
);

Image.belongsTo(User, { foreignKey: "userId" });
Image.belongsTo(Company, { foreignKey: "companyId" });

User.hasMany(Image, { foreignKey: "userId" });
Company.hasMany(Image, { foreignKey: "companyId" });

export default Image;
