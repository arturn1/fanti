using Domain.Commands.Contracts;
using Domain.Validation;
using System.Collections.Generic;
using Domain.Entities;

namespace Domain.Commands 
{

    public class UpdatePeriodCommand : ValidatableTypes, ICommand
    {
        public UpdatePeriodCommand(Guid id, int Duration, string Name, List<StaffEntity> Staffs)
        {
            this.Id = id;
            this.Duration = Duration;
            this.Name = Name;
            this.Staffs = Staffs;

        }

        public Guid Id { get; set; }
        public int Duration { get; set; }
        public string Name { get; set; }
        public List<StaffEntity> Staffs { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");
            
            return this.isValid;
        }
    }
}