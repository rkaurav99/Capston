using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dotnetapp.Migrations
{
    public partial class AddFeedbackBookingAndResponse : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminResponse",
                table: "Feedbacks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BookingId",
                table: "Feedbacks",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResponseDate",
                table: "Feedbacks",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Feedbacks_BookingId",
                table: "Feedbacks",
                column: "BookingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Feedbacks_Bookings_BookingId",
                table: "Feedbacks",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "BookingId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Feedbacks_Bookings_BookingId",
                table: "Feedbacks");

            migrationBuilder.DropIndex(
                name: "IX_Feedbacks_BookingId",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "AdminResponse",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "BookingId",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "ResponseDate",
                table: "Feedbacks");
        }
    }
}
