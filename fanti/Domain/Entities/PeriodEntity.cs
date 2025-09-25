using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    
    public class PeriodEntity : BaseEntity 
    {
        public PeriodEntity() 
        {
        }
        
        
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Name { get; set; }

    }
}