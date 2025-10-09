using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CodeDrawApi.Migrations
{
    /// <inheritdoc />
    public partial class FixPasswordColumnName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Passoword",
                table: "Users",
                newName: "Password");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Password",
                table: "Users",
                newName: "Passoword");
        }
    }
}
