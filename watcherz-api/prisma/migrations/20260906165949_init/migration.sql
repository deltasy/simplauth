-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "State" AS ENUM ('FOCUS', 'PAUSE', 'LAPSE', 'INTERRUPTED');

-- CreateEnum
CREATE TYPE "FocusType" AS ENUM ('DEEP', 'NORMAL', 'LIGHT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "username" TEXT,
    "permission" "Permission" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "owner_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "state" "State" NOT NULL,
    "focusLevel" "FocusType",
    "name" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
