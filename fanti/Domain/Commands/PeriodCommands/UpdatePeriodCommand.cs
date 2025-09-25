using Domain.Commands.Contracts;
using Domain.Validation;
using System.Collections.Generic;
using Domain.Entities;

namespace Domain.Commands 
{

    public class UpdatePeriodCommand : ValidatableTypes, ICommand
    {
        public UpdatePeriodCommand(Guid id, DateTime StartDate, DateTime EndDate, string Name, List<Guid> Staffs)
        {
            this.Id = id;
            this.Name = Name;
            this.Staffs = Staffs;
            this.StartDate = StartDate;
            this.EndDate = EndDate;

        }

        public Guid Id { get; set; }
        public string Name { get; set; }
        public List<Guid> Staffs { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");

            return this.isValid;
        }
    }
}