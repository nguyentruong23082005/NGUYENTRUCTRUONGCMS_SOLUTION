using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpgradeOrderStatusEnum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Orders
                SET Status = CASE Status
                    WHEN 0 THEN 1
                    WHEN 1 THEN 5
                    WHEN 2 THEN 7
                    WHEN 3 THEN 8
                    ELSE Status
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Orders
                SET Status = CASE Status
                    WHEN 1 THEN 0
                    WHEN 5 THEN 1
                    WHEN 7 THEN 2
                    WHEN 8 THEN 3
                    ELSE Status
                END
            ");
        }
    }
}
