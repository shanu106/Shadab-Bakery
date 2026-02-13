import { Component, OnInit, ChangeDetectorRef, Renderer2, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, DragDropModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  allTasks: Task[] = [];
  todoTasks: Task[] = [];
  inprogressTasks: Task[] = [];
  doneTasks: Task[] = [];

  searchText: string = '';
  currentView: string = 'laptop';
  isDarkTheme: boolean = false;

  showTaskModal = false;
  isEditMode = false;

  taskForm: Task = {
    id: 0,
    title: '',
    description: '',
    status: 'todo'
  };

  constructor(private cdr: ChangeDetectorRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.renderer.addClass(document.documentElement, 'dark-theme');
      this.isDarkTheme = true;
    } else {
      this.isDarkTheme = false;
    }

    this.allTasks = [
      { id: 1, title: 'Setup Angular Project', description: 'Initialize the Angular project with CDK', status: 'done' },
      { id: 2, title: 'Create Kanban Board', description: 'Design the UI for the Kanban board', status: 'inprogress' },
      { id: 3, title: 'Implement Drag & Drop', description: 'Add drag and drop functionality using Angular CDK', status: 'inprogress' },
      { id: 4, title: 'Add Task Modal', description: 'Create modal for adding and editing tasks', status: 'todo' },
      { id: 5, title: 'Style Components', description: 'Apply modern CSS styling to the board', status: 'todo' },
      { id: 6, title: 'Test Functionality', description: 'Test drag and drop between all columns', status: 'todo' }
    ];
    this.updateFilteredTasks();
  }

  updateFilteredTasks() {
    const filtered = this.allTasks.filter(task => this.taskMatchesSearch(task));
    this.todoTasks = filtered.filter(t => t.status === 'todo');
    this.inprogressTasks = filtered.filter(t => t.status === 'inprogress');
    this.doneTasks = filtered.filter(t => t.status === 'done');
  }

  filterTasks() {
    this.updateFilteredTasks();
  }

  taskMatchesSearch(task: Task): boolean {
    if (!this.searchText) return true;
    const text = this.searchText.toLowerCase();
    return task.title.toLowerCase().includes(text) || task.description.toLowerCase().includes(text);
  }

  openAddTaskModal() {
    this.isEditMode = false;
    this.taskForm = { id: 0, title: '', description: '', status: 'todo' };
    this.showTaskModal = true;
  }

  editTask(task: Task) {
    this.isEditMode = true;
    this.taskForm = { ...task };
    this.showTaskModal = true;
  }

  saveTask() {
    if (this.isEditMode) {
      const index = this.allTasks.findIndex(t => t.id === this.taskForm.id);
      this.allTasks[index] = { ...this.taskForm };
    } else {
      this.taskForm.id = Date.now();
      this.allTasks.push({ ...this.taskForm });
    }

    this.filterTasks();
    this.closeModal();
  }

  closeModal() {
    this.showTaskModal = false;
  }

  onDrop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const droppedTask = event.previousContainer.data[event.previousIndex];

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update status based on container id
      if (event.container.id === 'todo-list') {
        droppedTask.status = 'todo';
      } else if (event.container.id === 'inprogress-list') {
        droppedTask.status = 'inprogress';
      } else if (event.container.id === 'done-list') {
        droppedTask.status = 'done';
      }

      // Update in main allTasks array
      const taskIndex = this.allTasks.findIndex(t => t.id === droppedTask.id);
      if (taskIndex !== -1) {
        this.allTasks[taskIndex] = { ...droppedTask };
      }
    }
  }

  toggleTheme() {
    console.log('Toggling theme. Current theme:', this.isDarkTheme ? 'dark' : 'light');
    this.isDarkTheme = !this.isDarkTheme;
    
    if (this.isDarkTheme) {
    document.documentElement.classList.toggle('dark-theme', true);
      localStorage.setItem('theme', 'dark');
    } else {
     document.documentElement.classList.toggle('dark-theme', false); 
      localStorage.setItem('theme', 'light');
    }
    
    this.cdr.detectChanges();
  }

  deleteTask(task: Task) {
    const index = this.allTasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      this.allTasks.splice(index, 1);
      this.updateFilteredTasks();
    }
  }

  setView(view: string) {
    this.currentView = view;
  }

  addTaskFromSearch() {
    if (this.searchText.trim()) {
      this.filterTasks();
    }
  }

  moveToInProgress(task: Task) {
    task.status = 'inprogress';
    this.updateFilteredTasks();
  }

  moveToDone(task: Task) {
    task.status = 'done';
    this.updateFilteredTasks();
  }

  moveToTodo(task: Task) {
    task.status = 'todo';
    this.updateFilteredTasks();
  }
}
