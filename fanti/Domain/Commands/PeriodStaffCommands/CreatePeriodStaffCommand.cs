using Domain.Commands.Contracts;
using Domain.Validation;
using Domain.Entities;

namespace Domain.Commands
{

    public class CreatePeriodStaffCommand : ValidatableTypes, ICommand
    {
        public CreatePeriodStaffCommand(Guid StaffId, Guid PeriodId, int TotalHours)
        {

            this.StaffId = StaffId;
            this.PeriodId = PeriodId;
            this.TotalHours = TotalHours;

        }
        public Guid StaffId { get; set; }
        public Guid PeriodId { get; set; }
        public int TotalHours { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}