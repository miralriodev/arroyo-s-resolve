-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'visitor',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accommodations" (
    "id" BIGSERIAL NOT NULL,
    "host_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "rating" DECIMAL(3,2),
    "category" TEXT,
    "location" TEXT,
    "image_url" TEXT,
    "property_type" TEXT,
    "amenities" TEXT[],
    "max_guests" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accommodations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accommodation_images" (
    "id" BIGSERIAL NOT NULL,
    "accommodation_id" BIGINT NOT NULL,
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "accommodation_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."availability" (
    "id" BIGSERIAL NOT NULL,
    "accommodation_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "reserved" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookings" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID,
    "accommodation_id" BIGINT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" BIGSERIAL NOT NULL,
    "thread_id" BIGINT,
    "from_user" UUID,
    "accommodation_id" BIGINT,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "accommodation_id" BIGINT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" BIGSERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."review_pairs" (
    "bookingId" BIGINT NOT NULL,
    "accommodationId" BIGINT NOT NULL,
    "guest_user_id" UUID NOT NULL,
    "host_user_id" UUID NOT NULL,
    "guest_rating" INTEGER,
    "guest_comment" TEXT,
    "guest_submitted_at" TIMESTAMP(3),
    "host_rating" INTEGER,
    "host_comment" TEXT,
    "host_submitted_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "availability_accommodation_id_date_key" ON "public"."availability"("accommodation_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_accommodation_id_key" ON "public"."reviews"("user_id", "accommodation_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_key_key" ON "public"."categories"("key");

-- CreateIndex
CREATE UNIQUE INDEX "review_pairs_bookingId_key" ON "public"."review_pairs"("bookingId");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."accommodations" ADD CONSTRAINT "accommodations_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."accommodation_images" ADD CONSTRAINT "accommodation_images_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."availability" ADD CONSTRAINT "availability_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_from_user_fkey" FOREIGN KEY ("from_user") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."review_pairs" ADD CONSTRAINT "review_pairs_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."review_pairs" ADD CONSTRAINT "review_pairs_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "public"."accommodations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."review_pairs" ADD CONSTRAINT "review_pairs_guest_user_id_fkey" FOREIGN KEY ("guest_user_id") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."review_pairs" ADD CONSTRAINT "review_pairs_host_user_id_fkey" FOREIGN KEY ("host_user_id") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
