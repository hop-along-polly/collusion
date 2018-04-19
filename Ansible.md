# Ansible Fundamentals
    Ansible is an opensource, agentless IT automation tool that can be used to automatically provision, configure, manage and deploy software. Ansible is considered agentless because it uses ssh and winrm to communicate with Linux and windows hosts so no software(i.e. agent) needs to be installed on the target servers.

1. Inventory
    - Inventory File
        - Default Inventory file is located as `/etc/ansible/hosts`
        - uses similar syntax to an ini file.
    - Inventory Parameters _a.k.a variables_
        - `ansible_connection`: defines how Ansible connects to target server 
            - ssh
            - winrm
            - localhost _(Ansible will not connect to remote machines)_
        - `ansible_host`: defines the host name
        - `ansible_port`: Specifies which port Ansible connects over
            - Defaults to 22 for SSH
        - `ansible_user`: defines the user Ansible connects as
            - Defaults to root for Linux systems.
        - `ansible_ssh_pass`: The password to use for ssh connections.
        - `ansible_password`: The password to use form winrm connections.
        - Any number of arbitrary parameters can be defined as well and used as variables for each host as needed. _note: these will be interpreted as strings and not python literals_
            ```ini
            web1 ansible_host=web1.xyz.com custom_variable=1337
            ```

        _note: it is recommended to use Ansible Vault for passwords_

    - Alias
        - Servers must be specified using their FQDN.
        - The FQDN can be aliased using the `ansible_host` parameter.

        ```ini
        # web and db are the aliases for the FQDN's in the example.
        web = ansible_host=frontend.xyz.com
        db = ansible_host=postgres.xyz.com
        ```
    - Grouping
        - Servers can be grouped together and the group can be targeted so every server in a group will be acted upon.
        - If aliased the alias name should be used for the group instead of the FQDN
            ```ini
            # web_servers and databases are the groups in this example
            db ansible_host=postgres.xyz.com

            [web_servers]
            webserver1.xyz.com
            webserver2.xyz.com

            [databases]
            db
            ```
        - Additionally Groups of Groups can be specified using the `[groupname:children]` syntax
            ```ini
            # all is the group of groups while web_servers and databases are the groups in contains
            db ansible_host=postgres.xyz.com

            [web_servers]
            webserver1.xyz.com
            webserver2.xyz.com

            [databases]
            db

            [all:children]
            web_servers
            databases
            ```
2. Playbooks
    - The Orchestration Language of Ansible. Playbooks define what we want Ansible to do.
    - Written in YAML
    - Terminology
        - `Task`: An action to take on a host
        - `Play`: A series of tasks
        - `Module`: The actions run in a task i.e. (shell, command, yum, service etc.) 
    - Each Playbook contains a set of plays
    - Each YAML file is a different Playbook
        ```yaml
        -
            # This is considered the Play level
            name: Sample Play
            hosts: localhost # This can be an array of hosts or groups found in the inventory file
            tasks:
                # This is considered the task level
                - name: Say Hello
                  shell: echo 'Hello World!'
        ```
3. Modules
    - The actions run in a Play's task. i.e (shell, command, yum, etc.)
    - All modules can be found on the [Module Index](http://docs.ansible.com/ansible/latest/modules/modules_by_category.html) or by running `ansible-doc -l` from command line
    - Modules are categorized based on their functionality. These are a few of the categories
        - `System`: Actions perfomed at a system level (i.e. shutdown, restart etc.)
        - `Commands`: Actions used to execute commands or scripts
            - Use the `win_command` module when working with Windows
        - `Script`: Transfers a local script to remote nodes and runs it
        - `Files`: Actions performed on files that live on the target
        - `Database`: Actions for managing databases
        - `Cloud`: Actions for the various cloud providers
        - `Windows`: Actions specifically for Windows

    - Idempotency
        - Most modules are idempotent meaning that running the playbook multiple times would result in the same system state.
        - Example _If httpd is already started this play does nothing otherwise httpd is started_
            ```
            ...
            tasks:
              - name: Start httpd
                service: name=httpd state=started

            # Note the above is the same as 
            tasks:
              - name: Start httpd
                service:
                  name: httpd
                  state: started
            ```
4. Variables
    - Stores information that vary between hosts
    - Jinja2 templating is used for accessing variables
    - Variables can be declared in inside a(n)
        - Inventory file
            - ansible_host, ansible_user and ansible_ssh_pass etc. are examples of variables.
        - Playbook using the `vars` key
            ```yml
            -
            name: Sample Play
            hosts: localhost
            vars:
                greeting: Hello
            tasks:
                - name: Say Hello
                command: echo '{{ greeting }} World!' # Note the Jinja2 syntax {{ var_name }}
            ```
            _note the jinja2 syntax is only used in this example because the variable is being used within a string._
        - Standalone Variables file
            ```yaml
            # vars.yml
            greeting: Hello
            salutation: Hasta La Vista Baby
            ```
            ```yaml
            # greetings.yml
            -
              name: Converse
              hosts: localhost
              vars_files: #note to include variables we have to use the vars_files keyword
                - vars.yml
              tasks:
                - name: Say Hello
                  command: echo '{{ greeting }} World!'
                - name: Say Good-bye
                  command: echo '{{ salutation }}!'
            ```
        - Using a variable from the inventory file in the playbook
            ```ini
            #inventory file
            localhost ansible_connection=localhost nameserver_ip=192.168.0.0
            ```
            ```yaml
            # Playbook
            -
              name: Add nameserver
              hosts: localhost
              tasks:
                - name: Ensure nameserver line exists
                  lineinfile: path=/etc/resolv.conf line='{{ nameserver_ip }}' # Note the quotes are required here.
            ```
            _note: if the playbook specifies a host that does not have the variable being referenced the play will fail._


5. Conditionals
    - Used to control when a task is run
    - Conditionals are only used in a Playbook
    - The full list of supported operators can be found on the [docs.ansible.com Tests Page](https://docs.ansible.com/ansible/2.5/user_guide/playbooks_tests.html)
    - keywords
        - `when`: What actually performs the check
            ```yaml
            ...
            tasks:
                - name: conditionally restart SSH servers
                commmand: /sbin/shutdown -r
                when: ansible_connection == 'ssh' or
                        ansible_host == 'sample.xyz.com'
            ```
            _note this is not an ideal use of conditionals since ssh and winrm servers should have separate plays_
        - `register`: Used to store the output of a module.
            ```yaml
            ...
            tasks:
              - shell: cat /etc/resolv.conf
                register: name_servers
              - shell: echo 'nameserver 192.168.0.0 >> /etc/resolv.conf'
                when: name_servers.stdout.find('192.168.0.1') == -1
            ```
        
6. Loops
    - There are
    - `with_items`: A loop that will take each entry of the with_items array and substitute it with the `items` variable
        ```yaml
        ...
        tasks:
          name: Install Yum Dependencies
          yum: name='{{ items }}' state=present
          with_items:
              - httpd
              - git
              - nodejs
        ```
7. Includes
    - `includes`: Can be used to include playbooks, tasks, or variables from another YAML file.
        ```yaml
        # vars.yml
        greeting: Hello
        salutation: Hasta La Vista Baby
        ```
        ```yaml
        # conversation_tasks.yml
        - name: Say hello
          command: echo '{{ greeting }} World!'
        - name: Say Good-bye:
          command: echo '{{ salutation }}'
        ```
        ```yaml
        # converse.yml
        -
          name: A Brief Conversation
          hosts: localhost
          vars_files:
            - vars.yml
          tasks:
            - include conversation_tasks.yml
        ```
8. Roles
    - Ansible Roles define the folder structure and standards of an Ansible Project
    - Each Role must have a folder under the `roles` directory in your project.
    ```
    Projects/
      |  inventory.txt
      .  master_playbook.yml
      |  roles/
      .    |
      |    .  webservers/
      .    |    |  files
      |    .    .  templates
      .    |    |  tasks
      |    .    .  vars
      .    |    | 
      |    .  databases/
      .    |    |  files
      |    .    .  templates
      .    |    |  tasks
      |    .    .  vars
      .    |    |
    ```
    - `roles`: assigns a role at a playbook level
        ```yaml
        -
          name: Setup Firewall Servers
          hosts: web_servers
          roles:
            - webservers
        ```
9. Advanced topics
    - Preparing Windows servers
        - Ansible Control machines can only be Linux Machines
        - winrm has to be enabled for windows systems to be valid targets.
    - [Ansible Galaxy](galaxy.ansible.com)
        - Contains the `ansible-galaxy` cli tools
        - A repository for Ansible Roles similr to the Docker Store
    - Patterns
        - Regex like patterns
    - Dynamic Inventory
        - use `ansible-playbook -i` to specify an inventory file or python script
    - Developing Modules
        - Written in Python
        - module templates can be found on the Ansible Docs.
