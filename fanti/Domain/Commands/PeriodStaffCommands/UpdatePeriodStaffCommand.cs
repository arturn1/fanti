using Domain.Commands.Contracts;
using Domain.Validation;
using Domain.Entities;

namespace Domain.Commands 
{

    public class UpdatePeriodStaffCommand : ValidatableTypes, ICommand
    {
        public UpdatePeriodStaffCommand(int TotalHours)
        {
            this.TotalHours = TotalHours;

        }

        public Guid Id { get; set; }
        public int TotalHours { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");
            
            return this.isValid;
        }
    }
}