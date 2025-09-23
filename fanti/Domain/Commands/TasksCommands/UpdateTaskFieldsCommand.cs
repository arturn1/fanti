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
        public decimal? EstimatedHours { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? Progress { get; set; } // 0-100
        public string? Color { get; set; } // Hex color
        public bool? IsDisabled { get; set; }
        public bool? HideChildren { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }

        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}
