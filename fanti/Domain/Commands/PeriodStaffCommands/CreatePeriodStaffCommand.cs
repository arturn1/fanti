using Domain.Commands.Contracts;
using Domain.Validation;
using Domain.Entities;

namespace Domain.Commands 
{

    public class CreatePeriodStaffCommand : ValidatableTypes, ICommand
    {
        public CreatePeriodStaffCommand(StaffEntity Staff, PeriodEntity Period, int TotalHours, int TaskNumber)
        {
            
            this.Staff = Staff;
            this.Period = Period;
            this.TotalHours = TotalHours;
            this.TaskNumber = TaskNumber;

        }
        public StaffEntity Staff { get; set; }
        public PeriodEntity Period { get; set; }
        public int TotalHours { get; set; }
        public int TaskNumber { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}