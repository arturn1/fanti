using Domain.Commands.Contracts;
using Domain.Validation;
using System.Collections.Generic;
using Domain.Entities;

namespace Domain.Commands 
{

    public class CreatePeriodCommand : ValidatableTypes, ICommand
    {
        public CreatePeriodCommand(int Duration, string Name, List<Guid> Staffs)
        {
            
            this.Duration = Duration;
            this.Name = Name;
            this.Staffs = Staffs;

        }
        public int Duration { get; set; }
        public string Name { get; set; }
        public List<Guid> Staffs { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}