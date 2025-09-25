using Domain.Commands.Contracts;
using Domain.Validation;
using Domain.Entities;

namespace Domain.Commands 
{

    public class CreatePeriodStaffCommand : ValidatableTypes, ICommand
    {
        public CreatePeriodStaffCommand(StaffEntity Staff, Guid StaffId, Guid PeriodId, PeriodEntity Period, int TotalHours)
        {
            
            this.Staff = Staff;
            this.StaffId = StaffId;
            this.PeriodId = PeriodId;
            this.Period = Period;
            this.TotalHours = TotalHours;

        }
        public StaffEntity Staff { get; set; }
        public Guid StaffId { get; set; }
        public Guid PeriodId { get; set; }
        public PeriodEntity Period { get; set; }
        public int TotalHours { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}