-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ages" INTEGER,
ADD COLUMN     "class_" VARCHAR(30),
ADD COLUMN     "domicile" VARCHAR(50),
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "shortName" TEXT;
