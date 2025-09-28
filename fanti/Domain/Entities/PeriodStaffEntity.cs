using System;

namespace Domain.Entities
{

    public class PeriodStaffEntity : BaseEntity
    {
        public PeriodStaffEntity()
        {
        }

        public PeriodStaffEntity(StaffEntity Staff, Guid StaffId, Guid PeriodId, PeriodEntity Period, int TotalHours)
        {
            this.Staff = Staff;
            this.StaffId = StaffId;
            this.PeriodId = PeriodId;
            this.Period = Period;
            this.TotalHours = TotalHours;

        }

        public virtual StaffEntity Staff { get; set; }
        public Guid StaffId { get; set; }
        public Guid PeriodId { get; set; }
        public virtual PeriodEntity Period { get; set; }
        public int TotalHours { get; set; }

    }
}