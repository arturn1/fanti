using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{

    public class CreateTasksPeriodCommand : ValidatableTypes, ICommand
    {
        public CreateTasksPeriodCommand(Guid PeriodStaffId, int TaskNumber, int TaskHours, Guid ProjectId)
        {
            
            this.PeriodStaffId = PeriodStaffId;
            this.TaskNumber = TaskNumber;
            this.TaskHours = TaskHours;
            this.ProjectId = ProjectId;

        }
        public Guid PeriodStaffId { get; set; }
        public int TaskNumber { get; set; }
        public int TaskHours { get; set; }
        public Guid ProjectId { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}