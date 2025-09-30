using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace Domain.Enum
{
    public enum UserRole
    {
        Admin = 1,
        ProductOwner = 2,
        ScrumMaster = 3,
        Developer = 4,
        Stakeholder = 5
    }

    public enum ProjectStatus
    {
        Active,
        Completed,
        OnHold,
        Cancelled
    }

    public enum SprintStatus
    {
        Planning = 1,
        Active = 2,
        Review = 3,
        Retrospective = 4,
        Completed = 5
    }

    public enum TaskStatus
    {
        ToDo,
        InProgress,
        Done
    }

    public enum TaskType
    {
        [Display(Name = "task")]
        Task,
        [Display(Name = "milestone")]
        Milestone,
        [Display(Name = "project")]
        Project
    }

    public enum TaskCategory
    {
        Improvement,
        Development,
        Bug,
        HotFix,
    }

}

public static class EnumExtensions
{
    public static int ToInt(this Enum value)
    {
        return Convert.ToInt32(value);
    }

    public static string GetDisplayName(this Enum value)
    {
        var member = value.GetType().GetMember(value.ToString());
        if (member.Length > 0)
        {
            var attr = member[0].GetCustomAttribute<DisplayAttribute>();
            if (attr != null)
                return attr.Name;
        }
        return value.ToString();
    }
}