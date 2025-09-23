using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    
    public class PeriodEntity : BaseEntity 
    {
        public PeriodEntity() 
        {
                        Staffs = new List<StaffEntity>();
        }
        
        
        
        public int Duration { get; set; }
        public string Name { get; set; }
        public List<StaffEntity> Staffs { get; set; }

    }
}