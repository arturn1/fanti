using Domain.Commands.Contracts;
using Domain.Validation;
using Domain.Entities;

namespace Domain.Commands 
{

    public class UpdatePeriodStaffCommand : ValidatableTypes, ICommand
    {
        public UpdatePeriodStaffCommand(Guid id, StaffEntity Staff, PeriodEntity Period, int TotalHours, int TaskNumber)
        {
            this.Id = id;
            this.Staff = Staff;
            this.Period = Period;
            this.TotalHours = TotalHours;
            this.TaskNumber = TaskNumber;

        }

        public Guid Id { get; set; }
        public StaffEntity Staff { get; set; }
        public PeriodEntity Period { get; set; }
        public int TotalHours { get; set; }
        public int TaskNumber { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");
            
            return this.isValid;
        }
    }
}