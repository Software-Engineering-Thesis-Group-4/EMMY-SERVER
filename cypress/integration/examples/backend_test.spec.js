describe('First test', () =>{
   it('Checks for correct Form Input in Enrollment', () =>{
      //Arrange - setup initial app state
      // - visit a web page
      // - query for an element
      // Act - take an action
      // - interact with that element
      // Assert - make an assertion
      // - make an assertion about page content

      // saves a correct record of a new employee ==> success
      cy.visit('http://localhost:3000/enroll_employee.html')

   //    cy.visit({
   //       url: "http://localhost:3000/enroll_employee.html",
   //       method: "GET",
   //       body: {
   //          firstname: "first_name",
   //          lastname: "last_name",
   //          email: "developer@company.com",
   //          gender: "F",
   //          department: "Faculty",
   //          job_title: "HR Manager",
   //          fingerprint_id: "11"
   //       }
   //   });

     //cy.get('input[type="submit"]').click()

      cy.get('form').within(() => {
         cy.get('input[name="employee_id"]')
            .clear().type('201601120')
            .should('have.value', '201601120')

         cy.get('input[name="firstname"]')
            .clear().type('testFirstName1')
            .should('have.value', 'testFirstName1')

         cy.get('input[name="lastname"]')
            .clear().type('testLastName1')
            .should('have.value', 'testLastName1')

         cy.get('input[name="email"]')
            .clear().type('testEmail1@gmail.com')
            .should('have.value', 'testEmail1@gmail.com')

         cy.get('input[name="fingerprint_id"]')
            .clear().type('10')
            .should('have.value', '10')
      })

      // /api/employees
       cy.get('input[type="submit"]').click()
      //    .then((response) => {

      //    })

   }) //end of it('Checks for correct Form Input in Enrollment')

   // it('Check for Incorrect form input in Enrollment', () =>{
   //    cy.visit('./enroll_employee.html')
   // })
})