using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{

    public class UpdateTasksPeriodCommand : ValidatableTypes, ICommand
    {
        public UpdateTasksPeriodCommand(Guid id, Guid PeriodStaffId, int TaskNumber, int TaskHours)
        {
            this.Id = id;
            this.PeriodStaffId = PeriodStaffId;
            this.TaskNumber = TaskNumber;
            this.TaskHours = TaskHours;

        }

        public Guid Id { get; set; }
        public Guid PeriodStaffId { get; set; }
        public int TaskNumber { get; set; }
        public int TaskHours { get; set; }
        public Guid ProjectId { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");

            return this.isValid;
        }
    }
}