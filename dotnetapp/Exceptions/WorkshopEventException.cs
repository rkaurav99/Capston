using System;

namespace dotnetapp.Exceptions
{
    public class WorkshopEventException : Exception
    {
        public WorkshopEventException(string message) : base(message)
        {
        }
    }
}
