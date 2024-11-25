-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "clientOffset" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_clientOffset_key" ON "Message"("clientOffset");
