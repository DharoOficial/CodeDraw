using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CodeDrawApi.Migrations
{
    /// <inheritdoc />
    public partial class TurmaAddUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Turma",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Turma",
                table: "Users");
        }
    }
}
