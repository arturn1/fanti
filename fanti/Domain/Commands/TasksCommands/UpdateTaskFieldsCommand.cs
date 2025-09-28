using Domain.Commands.Contracts;
using Domain.Validation;
using System;

namespace Domain.Commands
{
    public class UpdateTaskFieldsCommand : ValidatableTypes, ICommand
    {
        public UpdateTaskFieldsCommand(Guid id)
        {
            this.Id = id;
        }

        public Guid Id { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? Progress { get; set; } // 0-100
        public decimal? EstimatedHours { get; set; }
        public string? Description { get; set; }
        public string? Title { get; set; }  

        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}
